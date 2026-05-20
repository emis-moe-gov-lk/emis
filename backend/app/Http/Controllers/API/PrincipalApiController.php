<?php

namespace App\Http\Controllers\API;

use Carbon\Carbon;
use App\Models\Principal;
use App\Http\Controllers\Controller;
use App\Models\EmployerAppointment;
use App\Models\EmployerCurrentAppointment;
use App\Models\DivisionalSecretariatOffice;
use App\Models\GnDivision;
use App\Models\People;
use App\Models\Position;
use App\Helpers\NicHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\PrincipalRecruitmentCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PrincipalApiController extends Controller
{
    private function hasAnyRole(array $roles, array $targets): bool
    {
        $normalizedTargets = collect($targets)
            ->filter(fn ($role) => is_string($role) && trim($role) !== '')
            ->map(fn (string $role) => strtolower(trim(preg_replace('/\s+/', ' ', $role) ?? $role)))
            ->values()
            ->all();

        return count(array_intersect($roles, $normalizedTargets)) > 0;
    }

    private function resolvedRoles(Request $request): array
    {
        $jwtRoles = (array) $request->attributes->get('jwt_roles', []);
        $dbRoles = $request->user()?->getRoleNames()?->all() ?? [];

        return collect(array_merge($jwtRoles, $dbRoles))
            ->filter(fn ($role) => is_string($role) && trim($role) !== '')
            ->map(fn (string $role) => strtolower(trim(preg_replace('/\s+/', ' ', $role) ?? $role)))
            ->unique()
            ->values()
            ->all();
    }

    private function isSuperAdmin(Request $request): bool
    {
        return in_array('super admin', $this->resolvedRoles($request), true);
    }

    private function canManagePrincipals(Request $request): bool
    {
        return $this->hasAnyRole($this->resolvedRoles($request), ['super admin', 'zonal deo', 'zonal deo head']);
    }

    private function resolveDsOffice(?string $value): ?DivisionalSecretariatOffice
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return null;
        }

        if (ctype_digit($normalized)) {
            return DivisionalSecretariatOffice::find((int) $normalized);
        }

        return DivisionalSecretariatOffice::where('dso_id', $normalized)->first();
    }

    private function resolveDsOfficePrimaryKey(?string $value): ?int
    {
        return $this->resolveDsOffice($value)?->id;
    }

    private function resolvePrincipalRecruitmentCategoryId(?string $value): ?string
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return null;
        }

        $direct = PrincipalRecruitmentCategory::query()
            ->where('category_id', $normalized)
            ->value('category_id');

        if ($direct) {
            return $direct;
        }

        if (ctype_digit($normalized)) {
            return PrincipalRecruitmentCategory::query()
                ->where('id', (int) $normalized)
                ->value('category_id');
        }

        return null;
    }

    public function store(Request $request)
    {
        try {
            $roles = $this->resolvedRoles($request);
            if (! $this->hasAnyRole($roles, ['super admin', 'zonal deo'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only Super Admin and Zonal DEO users can create principal profiles.',
                ], 403);
            }

            $validated = $request->validate([
                // PERSONAL
                'nic' => 'required|string',
                'is_new_registration' => 'required|boolean',

                'titleId' => 'required|string',
                'fullName' => 'required|string',
                'dateOfBirth' => 'required|date',
                'genderId' => 'required|string',
                'religionId' => 'required|string',
                'ethnicityId' => 'required|string',
                'civilStatusId' => 'required|string',
                'bloodGroupId' => 'required|string',

                'healthCondition' => 'required',
                'healthConditionDescription' => 'nullable|string',

                'districtId' => 'required|string',
                'gnDivisionId' => 'required|string',
                'dsOfficeId' => 'required|string',

                // CONTACT
                'email' => 'required|email',
                'contact' => 'required|string',

                'addressLine1' => 'required|string',
                'addressLine2' => 'required|string',
                'addressLine3' => 'nullable|string',
                'postalCode' => 'required|string',

                // FIRST APPOINTMENT
                'firstAppointmentCategory' => 'required|string',
                'firstAppointmentDate' => 'required|date',
                'firstAppointmentLetter' => 'required|string',
                'firstAppointmentService' => 'required|string',
                'firstAppointmentRank' => 'required|string',
                'firstAppointmentZone' => 'required|string',
                'firstAppointmentInstCategory' => 'required|string',
                'firstAppointmentInstitution' => 'required|string',
                'firstAppointmentPosition' => 'required|string',

                // CURRENT APPOINTMENT
                'currentAppointmentRegType' => 'required|string',
                'currentAppointmentDate' => 'required|date',
                'currentAppointmentLetter' => 'required|string',
                'currentAppointmentService' => 'required|string',
                'currentAppointmentRank' => 'required|string',
                'currentAppointmentSubject' => 'required|string',
                'currentAppointmentZone' => 'required|string',
                'currentAppointmentInstCategory' => 'required|string',
                'currentAppointmentInstitution' => 'required|string',
                'currentAppointmentPosition' => 'required|string',
            ]);

            $resolvedRecruitmentCategory = $this->resolvePrincipalRecruitmentCategoryId($validated['firstAppointmentCategory']);
            if (! $resolvedRecruitmentCategory) {
                throw ValidationException::withMessages([
                    'firstAppointmentCategory' => 'Invalid principal recruitment category selected.',
                ]);
            }

            DB::beginTransaction();

            $nic = NicHelper::normalize($validated['nic']);
            $initials = People::generateInitials($validated['fullName']);

            $people = People::updateOrCreate(
                ['nic_hash' => NicHelper::hash($nic)],
                [
                    'nic' => $nic,
                    'title_id' => $validated['titleId'],
                    'full_name' => ucwords(strtolower($validated['fullName'])),
                    'name_with_initials' => $initials,
                    'gender_id' => $validated['genderId'],
                    'date_of_birth' => $validated['dateOfBirth'],
                    'religion_id' => $validated['religionId'],
                    'ethnicity_id' => $validated['ethnicityId'],
                    'civil_status_id' => $validated['civilStatusId'],
                    'blood_group_id' => $validated['bloodGroupId'],
                    'health_condition' => $validated['healthCondition'],
                    'health_problem' => $validated['healthConditionDescription'],
                    'district_id' => $validated['districtId'],
                    'gn_division_id' => $validated['gnDivisionId'],
                    'ds_office_id' => $this->resolveDsOfficePrimaryKey($validated['dsOfficeId']),
                    'email' => strtolower($validated['email']),
                    'phone' => $validated['contact'],
                    'address_line1' => $validated['addressLine1'],
                    'address_line2' => $validated['addressLine2'],
                    'address_line3' => $validated['addressLine3'],
                    'postal_code' => $validated['postalCode'],
                    'profile_picture' => 'default.png',
                ]
            );

            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();
                throw new \Exception('This person already has an active appointment. Cannot register as a new principal.');
            }

            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(55);
            $appointmentId = EmployerAppointment::generateAppointmentId($validated['firstAppointmentDate']);

            EmployerAppointment::create([
                'appointment_id' => $appointmentId,
                'employee_id' => $people->people_id,
                'first_appointment_date' => $validated['firstAppointmentDate'],
                'retirement_date' => $retirementDate->toDateString(),
                'service_id' => $validated['firstAppointmentService'],
                'rank_id' => $validated['firstAppointmentRank'],
                'position_id' => $validated['firstAppointmentPosition'],
                'office_level_id' => 'OLID006',
                'workplace_id' => $validated['firstAppointmentInstitution'],
                'appointment_letter_no' => $validated['firstAppointmentLetter'],
                'appointment_letter' => 'none.pdf',
            ]);

            Principal::updateOrCreate(
                ['employee_id' => $people->people_id],
                [
                    'appointment_id' => $appointmentId,
                    'recruitment_category' => $resolvedRecruitmentCategory,
                ]
            );

            EmployerCurrentAppointment::create([
                'appointment_id' => $appointmentId,
                'employee_id' => $people->people_id,
                'appoint_date' => $validated['currentAppointmentDate'],
                'appointment_letter_no' => $validated['currentAppointmentLetter'],
                'service_id' => $validated['currentAppointmentService'],
                'rank_id' => $validated['currentAppointmentRank'],
                'office_level_id' => 'OLID006',
                'position_id' => $validated['currentAppointmentPosition'],
                'workplace_id' => $validated['currentAppointmentInstitution'],
            ]);

            DB::commit();

            $positionName = null;
            try {
                $positionName = Position::where('position_id', $validated['currentAppointmentPosition'])->value('position_name');
            } catch (\Throwable $ex) {
                Log::warning('Failed to resolve principal position name for response', ['error' => $ex->getMessage()]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Principal created successfully',
                'data' => [
                    'name' => $people->full_name,
                    'fullName' => $people->full_name,
                    'nic' => $people->nic,
                    'email' => $people->email,
                    'contact' => $people->phone,
                    'currentAppointmentPositionName' => $positionName,
                ],
                'people_id' => $people->people_id,
                'login_account_status' => 'pending_confirmation',
                'account_will_be_created_on_confirmation' => true,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'validation_error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Principal Store Error', ['error' => $e]);

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage() ?: 'Failed to create principal',
            ], 500);
        }
    }

    public function principalList(Request $request)
    {
        if (! $this->canManagePrincipals($request)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
            ], 403);
        }

        try {
            $perPage = (int) $request->get('per_page', 20);
            $nic = trim((string) $request->get('nic', ''));

            $baseQuery = People::query()
                ->whereHas('principal')
                ->whereHas('appointment');
            $query = clone $baseQuery;

            if ($nic !== '') {
                $matchedPeopleIds = (clone $baseQuery)
                    ->select(['people_id', 'nic', 'full_name', 'name_with_initials'])
                    ->get()
                    ->filter(function (People $person) use ($nic) {
                        return str_contains((string) $person->nic, $nic)
                            || str_contains((string) $person->full_name, $nic)
                            || str_contains((string) $person->name_with_initials, $nic);
                    })
                    ->pluck('people_id')
                    ->values();

                $query->whereIn('people_id', $matchedPeopleIds);
            }

            $query->with([
                'principal.recruitmentCategory',
                'appointment',
                'currentAppointment.workplace.institution',
            ]);

            $principals = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $principals,
            ]);
        } catch (\Throwable $e) {
            Log::error('Principal List Fetch Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch principal list',
            ], 500);
        }
    }

    public function getPrincipal(Request $request, string $people_id)
    {
        if (! $this->canManagePrincipals($request)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
            ], 403);
        }

        try {
            $principal = People::query()
                ->with([
                    'title',
                    'gender',
                    'religion',
                    'ethnicity',
                    'civilStatus',
                    'bloodGroup',
                    'district',
                    'gnDivision.divisionalSecretariatOffice',
                    'myAppointments',
                    'appointment',
                    'appointment.service',
                    'appointment.rank',
                    'appointment.position',
                    'appointment.workplace',
                    'appointment.workplace.institution',
                    'currentAppointment',
                    'currentAppointment.service',
                    'currentAppointment.rank',
                    'currentAppointment.position',
                    'appointmentHistory',
                    'currentAppointment.workplace',
                    'currentAppointment.workplace.ministry',
                    'currentAppointment.workplace.provincial',
                    'currentAppointment.workplace.zonal',
                    'currentAppointment.workplace.divisional',
                    'currentAppointment.workplace.institution',
                    'teacher',
                    'teacher.appointmentSubject',
                    'teacher.mainSubject',
                    'teacher.secondarySubject',
                    'teacher.currentTeachingSubject',
                    'principal',
                    'principal.recruitmentCategory',
                ])
                ->whereHas('principal')
                ->whereHas('appointment')
                ->where('people_id', $people_id)
                ->first();

            if (! $principal) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Principal not found',
                ], 404);
            }

            $dsOfficeId = $principal?->ds_office_id;

            return response()->json([
                'status' => 'success',
                'data' => $principal,
                'divisionalSecretariats' => $principal?->district_id
                    ? DivisionalSecretariatOffice::where('district_id', $principal->district_id)
                        ->active()
                        ->get()
                    : [],
                'gnDivisions' => $dsOfficeId
                    ? GnDivision::where('dso_id', $dsOfficeId)
                        ->active()
                        ->get()
                    : [],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Principal Profile Fetch Error', [
                'people_id' => $people_id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch principal profile',
            ], 500);
        }
    }

    public function recruitmentCategories(Request $request)
    {
        try {
            $categories = PrincipalRecruitmentCategory::active()->orderBy('category_name')->get();

            return response()->json([
                'status' => 'success',
                'data' => $categories,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Principal Recruitment Categories Fetch Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch principal recruitment categories',
            ], 500);
        }
    }
}