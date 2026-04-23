<?php

namespace App\Services;

use App\Models\Principal;
use App\Models\PrincipalRecruitmentCategory;
use App\Models\Service;
use App\Models\TeacherRoleTransition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TeacherToPrincipalPromotionService
{
    private const TEACHER_ROLE = 'teacher';
    private const PRINCIPAL_ROLE = 'principal';
    private const PRINCIPAL_SERVICE_NAME = 'SLPS';

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

        return [
            'promoted' => true,
            'reason' => null,
        ];
    }
}
