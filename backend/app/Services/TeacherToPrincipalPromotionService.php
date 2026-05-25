<?php

namespace App\Services;

use App\Models\Principal;
use App\Models\EmployerAppointment;
use App\Models\EmployerAppointmentHistory;
use App\Models\PrincipalRecruitmentCategory;
use App\Models\Service;
use App\Models\TeacherRoleTransition;
use App\Models\User;
use App\Services\Wso2IsProvisioningService;
use Illuminate\Support\Facades\DB;

class TeacherToPrincipalPromotionService
{
    public function __construct(private Wso2IsProvisioningService $wso2Is) {}

    private const TEACHER_ROLE = 'teacher';
    private const PRINCIPAL_ROLE = 'principal';
    private const PRINCIPAL_SERVICE_NAME = 'SLPS';
    private const PRINCIPAL_SERVICE_ID = 'SER004';
    private const PRINCIPAL_POSITION_ID = 'POS006';
    private const PRINCIPAL_RANK_ID = 'RANK010';

    public function normalizeRoleNames(array $roles): array
    {
        return collect($roles)
            ->filter(fn ($role) => is_string($role) && trim($role) !== '')
            ->map(fn (string $role) => strtolower(trim($role)))
            ->unique()
            ->values()
            ->all();
    }

    public function isTeacherToPrincipalTransition(array $previousRoles, array $targetRoles): bool
    {
        $previous = $this->normalizeRoleNames($previousRoles);
        $target = $this->normalizeRoleNames($targetRoles);

        return in_array(self::TEACHER_ROLE, $previous, true)
            && in_array(self::PRINCIPAL_ROLE, $target, true)
            && ! in_array(self::PRINCIPAL_ROLE, $previous, true);
    }

    /**
     * Promote an existing teacher-role user to principal in one transaction.
     *
     * @throws \RuntimeException
     */
    public function promote(User $user, array $targetRoles, ?string $changedByPeopleId = null, ?string $reason = null): array
    {
        $previousRoles = $user->roles()->pluck('name')->all();
        $normalizedPreviousRoles = $this->normalizeRoleNames($previousRoles);
        $normalizedTargetRoles = $this->normalizeRoleNames($targetRoles);

        if (! $this->isTeacherToPrincipalTransition($normalizedPreviousRoles, $normalizedTargetRoles)) {
            return [
                'promoted' => false,
                'reason' => 'not_teacher_to_principal_transition',
            ];
        }

        $person = $user->people()->with(['appointment', 'currentAppointment', 'principal'])->first();
        if (! $person) {
            throw new \RuntimeException('Linked person record is missing for this user.');
        }

        $currentAppointment = $person->currentAppointment;
        if (! $currentAppointment?->appointment_id) {
            throw new \RuntimeException('Teacher cannot be promoted without an active current appointment.');
        }

        $activeAppointment = $person->appointment;
        if (! $activeAppointment?->appointment_id) {
            throw new \RuntimeException('Teacher cannot be promoted without an active appointment record.');
        }

        $principalServiceId = Service::query()
            ->where('service_name', self::PRINCIPAL_SERVICE_NAME)
            ->value('service_id');

        if (! $principalServiceId) {
            throw new \RuntimeException('SLPS service is not configured.');
        }

        $defaultRecruitmentCategory = PrincipalRecruitmentCategory::query()
            ->active()
            ->orderBy('category_id')
            ->value('category_id');

        if (! $defaultRecruitmentCategory) {
            throw new \RuntimeException('Active principal recruitment category is not configured.');
        }

        DB::transaction(function () use (
            $user,
            $targetRoles,
            $person,
            $currentAppointment,
            $activeAppointment,
            $principalServiceId,
            $defaultRecruitmentCategory,
            $changedByPeopleId,
            $reason,
            $normalizedPreviousRoles,
            $normalizedTargetRoles
        ) {
            $user->syncRoles($targetRoles);

            Principal::updateOrCreate(
                ['employee_id' => $person->people_id],
                [
                    'appointment_id' => $activeAppointment->appointment_id,
                    'recruitment_category' => $defaultRecruitmentCategory,
                ]
            );

            if ($currentAppointment->service_id !== $principalServiceId) {
                $currentAppointment->service_id = $principalServiceId;
                $currentAppointment->save();
            }

            if ($activeAppointment->service_id !== $principalServiceId) {
                $activeAppointment->service_id = $principalServiceId;
                $activeAppointment->save();
            }

            TeacherRoleTransition::create([
                'employee_id' => $person->people_id,
                'user_id' => $user->id,
                'appointment_id' => $activeAppointment->appointment_id,
                'from_role' => self::TEACHER_ROLE,
                'to_role' => self::PRINCIPAL_ROLE,
                'changed_by' => $changedByPeopleId,
                'changed_at' => now(),
                'reason' => $reason,
                'metadata' => [
                    'before_roles' => $normalizedPreviousRoles,
                    'after_roles' => $normalizedTargetRoles,
                ],
            ]);
        });

        $isRoleUpdate = $this->wso2Is->updateUserRole($user, self::TEACHER_ROLE, self::PRINCIPAL_ROLE);

        return [
            'promoted' => true,
            'reason' => null,
            'is_role_update' => $isRoleUpdate,
        ];
    }

    /**
     * Promote a teacher by deactivating the active appointment and creating a new principal appointment.
     *
     * @throws \RuntimeException
     */
    public function promoteWithAppointmentTransition(User $user, ?string $changedByPeopleId = null, ?string $reason = null): array
    {
        $previousRoles = $user->roles()->pluck('name')->all();
        $normalizedPreviousRoles = $this->normalizeRoleNames($previousRoles);
        $targetRoles = collect($normalizedPreviousRoles)
            ->reject(fn (string $role) => $role === self::TEACHER_ROLE)
            ->push(self::PRINCIPAL_ROLE)
            ->unique()
            ->values()
            ->all();

        if (! $this->isTeacherToPrincipalTransition($normalizedPreviousRoles, $targetRoles)) {
            return [
                'promoted' => false,
                'reason' => 'not_teacher_to_principal_transition',
            ];
        }

        $person = $user->people()->with(['appointment', 'currentAppointment', 'principal'])->first();
        if (! $person) {
            throw new \RuntimeException('Linked person record is missing for this user.');
        }

        $currentAppointment = $person->currentAppointment;
        if (! $currentAppointment?->appointment_id) {
            throw new \RuntimeException('Teacher cannot be promoted without an active current appointment.');
        }

        $activeAppointment = $person->appointment;
        if (! $activeAppointment?->appointment_id || (int) $activeAppointment->active_status !== 1) {
            throw new \RuntimeException('Teacher cannot be promoted without an active appointment record.');
        }

        if ((string) $activeAppointment->service_id === self::PRINCIPAL_SERVICE_ID) {
            return [
                'promoted' => false,
                'reason' => 'already_principal_service',
            ];
        }

        $existingPrincipalServiceAppointment = EmployerAppointment::query()
            ->where('employee_id', $person->people_id)
            ->where('service_id', self::PRINCIPAL_SERVICE_ID)
            ->exists();

        if ($existingPrincipalServiceAppointment) {
            return [
                'promoted' => false,
                'reason' => 'principal_service_appointment_exists',
            ];
        }

        $principalServiceId = Service::query()
            ->where('service_name', self::PRINCIPAL_SERVICE_NAME)
            ->value('service_id');

        if (! $principalServiceId || $principalServiceId !== self::PRINCIPAL_SERVICE_ID) {
            throw new \RuntimeException('SLPS service is not configured correctly.');
        }

        $defaultRecruitmentCategory = PrincipalRecruitmentCategory::query()
            ->active()
            ->orderBy('category_id')
            ->value('category_id');

        if (! $defaultRecruitmentCategory) {
            throw new \RuntimeException('Active principal recruitment category is not configured.');
        }

        $newAppointment = DB::transaction(function () use (
            $user,
            $person,
            $activeAppointment,
            $currentAppointment,
            $targetRoles,
            $defaultRecruitmentCategory,
            $changedByPeopleId,
            $reason,
            $normalizedPreviousRoles
        ) {
            EmployerAppointmentHistory::create([
                'appointment_id' => $activeAppointment->appointment_id,
                'employee_id' => $person->people_id,
                'appoint_date' => $currentAppointment->appoint_date?->toDateString()
                    ?? $activeAppointment->first_appointment_date?->toDateString()
                    ?? now()->toDateString(),
                'end_date' => now()->toDateString(),
                'service_id' => $activeAppointment->service_id,
                'rank_id' => $activeAppointment->rank_id,
                'position_id' => $activeAppointment->position_id,
                'office_level_id' => $activeAppointment->office_level_id,
                'workplace_id' => $activeAppointment->workplace_id,
                'updated_type' => '0',
            ]);

            $activeAppointment->active_status = 0;
            $activeAppointment->save();

            $createdAppointment = EmployerAppointment::create([
                'employee_id' => $person->people_id,
                'first_appointment_date' => $activeAppointment->first_appointment_date?->toDateString() ?? now()->toDateString(),
                'retirement_date' => $activeAppointment->retirement_date?->toDateString()
                    ?? now()->addYears(55)->toDateString(),
                'service_id' => self::PRINCIPAL_SERVICE_ID,
                'rank_id' => self::PRINCIPAL_RANK_ID,
                'position_id' => self::PRINCIPAL_POSITION_ID,
                'office_level_id' => $activeAppointment->office_level_id,
                'workplace_id' => $activeAppointment->workplace_id,
                'appointment_letter_no' => $activeAppointment->appointment_letter_no,
                'appointment_letter' => $activeAppointment->appointment_letter,
                'pay_sheet_no' => $activeAppointment->pay_sheet_no,
                'w_op_no' => $activeAppointment->w_op_no,
                'is_verified' => 0,
                'is_confirmed' => 0,
                'active_status' => 1,
            ]);

            $currentAppointment->appointment_id = $createdAppointment->appointment_id;
            $currentAppointment->service_id = self::PRINCIPAL_SERVICE_ID;
            $currentAppointment->rank_id = self::PRINCIPAL_RANK_ID;
            $currentAppointment->position_id = self::PRINCIPAL_POSITION_ID;
            $currentAppointment->office_level_id = $createdAppointment->office_level_id;
            $currentAppointment->workplace_id = $createdAppointment->workplace_id;
            $currentAppointment->save();

            $user->syncRoles($targetRoles);

            Principal::updateOrCreate(
                ['employee_id' => $person->people_id],
                [
                    'appointment_id' => $createdAppointment->appointment_id,
                    'recruitment_category' => $defaultRecruitmentCategory,
                ]
            );

            TeacherRoleTransition::create([
                'employee_id' => $person->people_id,
                'user_id' => $user->id,
                'appointment_id' => $createdAppointment->appointment_id,
                'from_role' => self::TEACHER_ROLE,
                'to_role' => self::PRINCIPAL_ROLE,
                'changed_by' => $changedByPeopleId,
                'changed_at' => now(),
                'reason' => $reason,
                'metadata' => [
                    'before_roles' => $normalizedPreviousRoles,
                    'after_roles' => $targetRoles,
                    'source_appointment_id' => $activeAppointment->appointment_id,
                ],
            ]);

            return $createdAppointment;
        });

        $isRoleUpdate = $this->wso2Is->updateUserRole($user, self::TEACHER_ROLE, self::PRINCIPAL_ROLE);

        return [
            'promoted' => true,
            'reason' => null,
            'new_appointment_id' => $newAppointment->appointment_id,
            'old_appointment_id' => $activeAppointment->appointment_id,
            'is_role_update' => $isRoleUpdate,
        ];
    }
}
