<?php

namespace App\Http\Controllers\API;

use App\Helpers\NicHelper;
use App\Http\Controllers\Controller;
use App\Models\DivisionalSecretariatOffice;
use App\Models\EmployerAppointment;
use App\Models\EmployerAppointmentHistory;
use App\Models\EmployerCurrentAppointment;
use App\Models\People;
use App\Models\Position;
use App\Models\User;
use App\Services\Wso2IsProvisioningService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class MoeAdministratorController extends Controller
{
    private const DEFAULT_CURRENT_SERVICE_ID = 'SER006';
    private const MOE_OFFICE_LEVEL = 'OLID001';
    private const MOE_ADMIN_ROLE = 'MOE Administrator';

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

    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $search  = trim($request->get('search', $request->get('nic', '')));

            $peopleIds = User::query()
                ->whereHas('roles', function ($query) {
                    $query->where('name', self::MOE_ADMIN_ROLE);
                })
                ->pluck('people_id');

            $baseQuery = People::query()->whereIn('people_id', $peopleIds);
            $query = clone $baseQuery;

            if ($search !== '') {
                $isNicSearch = is_numeric(substr($search, 0, 1));

                if ($isNicSearch) {
                    $matchedPeopleIds = (clone $baseQuery)
                        ->select(['people_id', 'nic'])
                        ->get()
                        ->filter(fn (People $person) => str_contains((string) $person->nic, $search))
                        ->pluck('people_id')
                        ->values();
                } else {
                    $searchLower = strtolower($search);
                    $matchedPeopleIds = (clone $baseQuery)
                        ->select(['people_id', 'full_name', 'name_with_initials'])
                        ->get()
                        ->filter(function (People $person) use ($searchLower) {
                            return str_contains(strtolower((string) $person->full_name), $searchLower)
                                || str_contains(strtolower((string) $person->name_with_initials), $searchLower);
                        })
                        ->pluck('people_id')
                        ->values();
                }

                $query->whereIn('people_id', $matchedPeopleIds);
            }

            $admins = $query
                ->with([
                    'title',
                    'gender',
                    'appointment',
                    'currentAppointment.service',
                    'currentAppointment.rank',
                    'currentAppointment.position',
                    'currentAppointment.workplace',
                ])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'status'       => 'success',
                'data'         => $admins->items(),
                'total'        => $admins->total(),
                'per_page'     => $admins->perPage(),
                'current_page' => $admins->currentPage(),
                'last_page'    => $admins->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('MOE Administrator List Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch MOE administrator list',
            ], 500);
        }
    }

    public function show($people_id)
    {
        try {
            $admin = People::with([
                'title',
                'gender',
                'religion',
                'ethnicity',
                'civilStatus',
                'bloodGroup',
                'district',
                'dsOffice',
                'gnDivision.divisionalSecretariatOffice',
                'appointment.recruitmentCategory',
                'appointment.recruitmentSubject',
                'currentAppointment.service',
                'currentAppointment.rank',
                'currentAppointment.position',
                'currentAppointment.workplace',
                'myAppointments.service',
                'myAppointments.rank',
                'myAppointments.position',
                'myAppointments.workplace.institution',
                'appointmentHistory.service',
                'appointmentHistory.rank',
                'appointmentHistory.position',
                'appointmentHistory.workplace.institution',
                'educationQualifications',
                'educationQualifications.qualification',
                'educationQualifications.qualificationGrade',
            ])->where('people_id', $people_id)->first();

            if (! $admin) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'MOE administrator not found',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $admin,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('MOE Administrator Show Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch MOE administrator profile',
            ], 500);
        }
    }

    public function store(Request $request, Wso2IsProvisioningService $wso2Is)
    {
        try {
            $validated = $request->validate([
                'nic'                         => 'required|string',
                'is_new_registration'         => 'required|boolean',
                'titleId'                     => 'required|string',
                'fullName'                    => 'required|string',
                'dateOfBirth'                 => 'required|date',
                'genderId'                    => 'required|string',
                'religionId'                  => 'required|string',
                'ethnicityId'                 => 'required|string',
                'civilStatusId'               => 'required|string',
                'bloodGroupId'                => 'required|string',
                'healthCondition'             => 'required',
                'healthConditionDescription'  => 'nullable|string',
                'districtId'                  => 'required|string',
                'gnDivisionId'                => 'required|string',
                'dsOfficeId'                  => 'required|string',
                'email'                       => 'required|email',
                'contact'                     => 'required|string',
                'addressLine1'                => 'required|string',
                'addressLine2'                => 'required|string',
                'addressLine3'                => 'nullable|string',
                'postalCode'                  => 'required|string',
                'firstAppointmentDate'        => 'nullable|date',
                'firstAppointmentLetter'      => 'nullable|string',
                'firstAppointmentService'     => 'nullable|string',
                'firstAppointmentRank'        => 'nullable|string',
                'firstAppointmentOfficeLevel' => 'nullable|string',
                'firstAppointmentWorkplace'   => 'nullable|string',
                'firstAppointmentPosition'    => 'nullable|string',
                'recruitmentCategory'         => 'nullable|string',
                'recruitmentSubject'          => 'nullable|string',
                'currentAppointmentDate'      => 'required|date',
                'currentAppointmentLetter'    => 'required|string',
                'currentAppointmentService'   => 'required|string|exists:services,service_id',
                'currentAppointmentRank'      => 'required|string',
                'currentAppointmentWorkplace' => 'required|string',
                'currentAppointmentPosition'  => 'required|string',
            ]);

            DB::beginTransaction();

            $nic      = NicHelper::normalize($validated['nic']);
            $initials = People::generateInitials($validated['fullName']);

            $people = People::updateOrCreate(
                ['nic_hash' => NicHelper::hash($nic)],
                [
                    'nic'                => $nic,
                    'title_id'           => $validated['titleId'],
                    'full_name'          => ucwords(strtolower($validated['fullName'])),
                    'name_with_initials' => $initials,
                    'gender_id'          => $validated['genderId'],
                    'date_of_birth'      => $validated['dateOfBirth'],
                    'religion_id'        => $validated['religionId'],
                    'ethnicity_id'       => $validated['ethnicityId'],
                    'civil_status_id'    => $validated['civilStatusId'],
                    'blood_group_id'     => $validated['bloodGroupId'],
                    'health_condition'   => $validated['healthCondition'],
                    'health_problem'     => $validated['healthConditionDescription'],
                    'district_id'        => $validated['districtId'],
                    'gn_division_id'     => $validated['gnDivisionId'],
                    'ds_office_id'       => $this->resolveDsOfficePrimaryKey($validated['dsOfficeId']),
                    'email'              => strtolower($validated['email']),
                    'phone'              => $validated['contact'],
                    'address_line1'      => $validated['addressLine1'],
                    'address_line2'      => $validated['addressLine2'],
                    'address_line3'      => $validated['addressLine3'],
                    'postal_code'        => $validated['postalCode'],
                    'profile_picture'    => 'default.png',
                ]
            );

            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();
                throw new \Exception('This person already has an active appointment. Cannot register again.');
            }

            $firstAppointmentDate = $validated['firstAppointmentDate'] ?? $validated['currentAppointmentDate'];
            $firstAppointmentLetter = $validated['firstAppointmentLetter'] ?? $validated['currentAppointmentLetter'];
            $firstAppointmentService = $validated['firstAppointmentService'] ?? $validated['currentAppointmentService'] ?? self::DEFAULT_CURRENT_SERVICE_ID;
            $firstAppointmentRank = $validated['firstAppointmentRank'] ?? $validated['currentAppointmentRank'];
            $firstAppointmentOfficeLevel = $validated['firstAppointmentOfficeLevel'] ?? self::MOE_OFFICE_LEVEL;
            $firstAppointmentWorkplace = $validated['firstAppointmentWorkplace'] ?? $validated['currentAppointmentWorkplace'];
            $firstAppointmentPosition = $validated['firstAppointmentPosition'] ?? $validated['currentAppointmentPosition'];
            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(55);
            $appointmentId  = EmployerAppointment::generateAppointmentId($firstAppointmentDate);

            EmployerAppointment::create([
                'appointment_id'          => $appointmentId,
                'employee_id'             => $people->people_id,
                'first_appointment_date'  => $firstAppointmentDate,
                'retirement_date'         => $retirementDate->toDateString(),
                'service_id'              => $firstAppointmentService,
                'rank_id'                 => $firstAppointmentRank,
                'position_id'             => $firstAppointmentPosition,
                'office_level_id'         => $firstAppointmentOfficeLevel,
                'workplace_id'            => $firstAppointmentWorkplace,
                'appointment_letter_no'   => $firstAppointmentLetter,
                'appointment_letter'      => 'none.pdf',
                'recruitment_category_id' => $validated['recruitmentCategory'] ?? null,
                'recruitment_subject_id'  => $validated['recruitmentSubject'] ?? null,
            ]);

            EmployerCurrentAppointment::create([
                'appointment_id'        => $appointmentId,
                'employee_id'           => $people->people_id,
                'appoint_date'          => $validated['currentAppointmentDate'],
                'appointment_letter_no' => $validated['currentAppointmentLetter'],
                'service_id'            => $validated['currentAppointmentService'] ?? self::DEFAULT_CURRENT_SERVICE_ID,
                'rank_id'               => $validated['currentAppointmentRank'],
                'office_level_id'       => self::MOE_OFFICE_LEVEL,
                'position_id'           => $validated['currentAppointmentPosition'],
                'workplace_id'          => $validated['currentAppointmentWorkplace'],
            ]);

            $user = User::create([
                'nic'       => $nic,
                'nic_hash'  => NicHelper::hash($nic),
                'people_id' => $people->people_id,
                'name'      => $people->name_with_initials,
                'email'     => strtolower($validated['email']),
                'contact'   => $validated['contact'],
                'password'  => Hash::make('Password@123'),
            ]);

            $user->assignRole(self::MOE_ADMIN_ROLE);

            DB::commit();

            $wso2Is->provisionUser($user, 'Password@123', self::MOE_ADMIN_ROLE);

            $positionName = Position::where('position_id', $validated['currentAppointmentPosition'])
                ->value('position_name');

            return response()->json([
                'status'  => 'success',
                'message' => 'MOE administrator registered successfully',
                'data'    => [
                    'name'                           => $people->full_name,
                    'fullName'                       => $people->full_name,
                    'nic'                            => $people->nic,
                    'email'                          => $people->email,
                    'contact'                        => $people->phone,
                    'role'                           => self::MOE_ADMIN_ROLE,
                    'currentAppointmentPositionName' => $positionName,
                ],
                'people_id'        => $people->people_id,
                'default_password' => 'Password@123',
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('MOE Administrator Store Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function addServiceHistoryEntry(Request $request, string $id)
    {
        $jwtRoles = (array) $request->attributes->get('jwt_roles', []);
        $dbRoles  = $request->user()?->getRoleNames()?->all() ?? [];
        $roles    = array_unique(array_merge(
            array_map('strtolower', $jwtRoles),
            array_map('strtolower', $dbRoles),
        ));

        $allowed = ['super admin', 'moe administrator'];
        if (empty(array_intersect($roles, $allowed))) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'appointment_id'        => 'required|string|exists:employer_appointments,appointment_id',
                'appoint_date'          => 'required|date',
                'end_date'              => 'nullable|date|after_or_equal:appoint_date',
                'service_id'            => 'required|string|exists:services,service_id',
                'rank_id'               => 'required|string|exists:service_ranks,rank_id',
                'position_id'           => 'required|string|exists:positions,position_id',
                'office_level_id'       => 'required|string|exists:office_levels,office_level_id',
                'workplace_id'          => 'required|string',
                'updated_type'          => 'required|in:0,1,2,3,4',
                'appointment_letter_no' => 'nullable|string|max:100',
                'remarks'               => 'nullable|string|max:500',
            ]);

            $person = People::where('people_id', $id)->first();
            if (! $person) {
                return response()->json(['status' => 'error', 'message' => 'Person not found'], 404);
            }

            $appointment = EmployerAppointment::where('appointment_id', $validated['appointment_id'])
                ->where('employee_id', $id)
                ->first();

            if (! $appointment) {
                return response()->json(['status' => 'error', 'message' => 'Appointment not found for this person'], 404);
            }

            $entry = EmployerAppointmentHistory::create([
                'appointment_id'        => $validated['appointment_id'],
                'employee_id'           => $id,
                'appoint_date'          => $validated['appoint_date'],
                'end_date'              => $validated['end_date'] ?? null,
                'service_id'            => $validated['service_id'],
                'rank_id'               => $validated['rank_id'],
                'position_id'           => $validated['position_id'],
                'office_level_id'       => $validated['office_level_id'],
                'workplace_id'          => $validated['workplace_id'],
                'updated_type'          => $validated['updated_type'],
                'appointment_letter_no' => $validated['appointment_letter_no'] ?? null,
                'remarks'               => $validated['remarks'] ?? null,
            ]);

            $entry->load(['service', 'rank', 'position', 'workplace.institution']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Service history entry added successfully',
                'data'    => $entry,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Add MOE Administrator Service History Entry Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json(['status' => 'error', 'message' => 'Failed to add service history entry'], 500);
        }
    }

    public function addPastService(Request $request, string $id)
    {
        $jwtRoles = (array) $request->attributes->get('jwt_roles', []);
        $dbRoles  = $request->user()?->getRoleNames()?->all() ?? [];
        $roles    = array_unique(array_merge(
            array_map('strtolower', $jwtRoles),
            array_map('strtolower', $dbRoles),
        ));

        $allowed = ['super admin', 'moe administrator'];
        if (empty(array_intersect($roles, $allowed))) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'service_id'             => 'required|string|exists:services,service_id',
                'rank_id'                => 'required|string|exists:service_ranks,rank_id',
                'position_id'            => 'required|string|exists:positions,position_id',
                'office_level_id'        => 'required|string|exists:office_levels,office_level_id',
                'workplace_id'           => 'required|string',
                'first_appointment_date' => 'required|date',
                'appointment_letter_no'  => 'nullable|string|max:100',
            ]);

            $person = People::where('people_id', $id)->first();
            if (! $person) {
                return response()->json(['status' => 'error', 'message' => 'Person not found'], 404);
            }

            $alreadyExists = EmployerAppointment::where('employee_id', $id)
                ->where('service_id', $validated['service_id'])
                ->exists();

            if ($alreadyExists) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'A service block for this service already exists for this person.',
                ], 422);
            }

            $retirementDate = Carbon::parse($person->date_of_birth)->addYears(55);

            $appointment = EmployerAppointment::create([
                'employee_id'            => $id,
                'first_appointment_date' => $validated['first_appointment_date'],
                'retirement_date'        => $retirementDate->toDateString(),
                'service_id'             => $validated['service_id'],
                'rank_id'                => $validated['rank_id'],
                'position_id'            => $validated['position_id'],
                'office_level_id'        => $validated['office_level_id'],
                'workplace_id'           => $validated['workplace_id'],
                'appointment_letter_no'  => $validated['appointment_letter_no'] ?? null,
                'appointment_letter'     => 'none.pdf',
                'active_status'          => false,
            ]);

            $appointment->load(['service', 'rank', 'position', 'workplace.institution']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Past service block added successfully',
                'data'    => $appointment,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Add MOE Administrator Past Service Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $jwtRoles = (array) $request->attributes->get('jwt_roles', []);
        $dbRoles  = $request->user()?->getRoleNames()?->all() ?? [];
        $roles    = array_unique(array_merge(
            array_map('strtolower', $jwtRoles),
            array_map('strtolower', $dbRoles),
        ));

        $allowed = ['super admin', 'moe administrator'];
        if (empty(array_intersect($roles, $allowed))) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        try {
            $people = People::where('people_id', $id)->first();
            if (!$people) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'MOE administrator not found',
                ], 404);
            }

            $section = (string) $request->input('section');
            if (!in_array($section, ['personal', 'health', 'contact', 'temporary', 'current_appointment', 'my_appointment', 'wop'], true)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid update section',
                ], 422);
            }

            $rules = match ($section) {
                'personal' => [
                    'titleId'       => 'required|string',
                    'fullName'      => 'required|string|max:255',
                    'genderId'      => 'required|string',
                    'dateOfBirth'   => 'required|date',
                    'ethnicityId'   => 'required|string',
                    'religionId'    => 'required|string',
                    'civilStatusId' => 'required|string',
                ],
                'health' => [
                    'bloodGroupId'    => 'required|string',
                    'healthCondition' => 'required|in:0,1',
                    'knownProblems'   => 'nullable|string|max:500',
                ],
                'contact' => [
                    'email'        => 'required|email',
                    'phone'        => 'required|digits:10',
                    'districtId'   => 'required|string',
                    'dsOfficeId'   => 'required|string',
                    'gnDivisionId' => 'required|string',
                    'addressLine1' => 'required|string|max:255',
                    'addressLine2' => 'required|string|max:255',
                    'addressLine3' => 'nullable|string|max:255',
                    'postalCode'   => 'required|string|max:20',
                ],
                'temporary' => [
                    'tAddressLine1' => 'nullable|string|max:255',
                    'tAddressLine2' => 'nullable|string|max:255',
                    'tAddressLine3' => 'nullable|string|max:255',
                    'tPostalCode'   => 'nullable|string|max:20',
                ],
                'current_appointment' => [
                    'currentAppointmentDate' => 'required|date',
                    'currentAppointmentService' => 'required|string|exists:services,service_id',
                    'currentAppointmentRank' => 'required|string|exists:service_ranks,rank_id',
                    'currentAppointmentPosition' => 'required|string|exists:positions,position_id',
                ],
                'my_appointment' => [
                    'firstAppointmentDate' => 'required|date',
                    'firstAppointmentLetter' => 'required|string|max:100',
                    'firstAppointmentService' => 'required|string|exists:services,service_id',
                    'firstAppointmentRank' => 'required|string|exists:service_ranks,rank_id',
                    'firstAppointmentPosition' => 'required|string|exists:positions,position_id',
                ],
                'wop' => [
                    'w_op_no' => 'required|string|max:10',
                    'pay_sheet_no' => 'required|string|max:10',
                ]
            };

            $validated = $request->validate($rules);

            DB::beginTransaction();

            if ($section === 'personal') {
                $people->update([
                    'title_id'           => $validated['titleId'],
                    'full_name'          => ucwords(strtolower($validated['fullName'])),
                    'name_with_initials' => People::generateInitials($validated['fullName']),
                    'gender_id'          => $validated['genderId'],
                    'date_of_birth'      => $validated['dateOfBirth'],
                    'religion_id'        => $validated['religionId'],
                    'ethnicity_id'       => $validated['ethnicityId'],
                    'civil_status_id'    => $validated['civilStatusId'],
                ]);

                User::where('people_id', $people->people_id)->update([
                    'name' => $people->name_with_initials,
                ]);
            }

            if ($section === 'health') {
                $people->update([
                    'blood_group_id'   => $validated['bloodGroupId'],
                    'health_condition' => $validated['healthCondition'],
                    'health_problem'   => $validated['healthCondition'] == 1 ? null : ($validated['knownProblems'] ?? null),
                ]);
            }

            if ($section === 'contact') {
                $email = strtolower(trim((string) $validated['email']));
                $phone = (string) $validated['phone'];

                $emailConflict = People::query()
                    ->where('email', $email)
                    ->where('people_id', '!=', $people->people_id)
                    ->exists()
                    || User::query()
                        ->where('email', $email)
                        ->where('people_id', '!=', $people->people_id)
                        ->exists();

                $phoneConflict = People::query()
                    ->where('phone', $phone)
                    ->where('people_id', '!=', $people->people_id)
                    ->exists()
                    || User::query()
                        ->where('contact', $phone)
                        ->where('people_id', '!=', $people->people_id)
                        ->exists();

                if ($emailConflict) {
                    DB::rollBack();
                    return response()->json(['status' => 'error', 'message' => 'Email is already taken'], 422);
                }

                if ($phoneConflict) {
                    DB::rollBack();
                    return response()->json(['status' => 'error', 'message' => 'Phone number is already taken'], 422);
                }

                $people->update([
                    'email'          => $email,
                    'phone'          => $phone,
                    'district_id'    => $validated['districtId'],
                    'ds_office_id'   => $this->resolveDsOfficePrimaryKey($validated['dsOfficeId']),
                    'gn_division_id' => $validated['gnDivisionId'],
                    'address_line1'  => $validated['addressLine1'],
                    'address_line2'  => $validated['addressLine2'],
                    'address_line3'  => $validated['addressLine3'] ?? null,
                    'postal_code'    => $validated['postalCode'],
                ]);

                User::where('people_id', $people->people_id)->update([
                    'email'   => $email,
                    'contact' => $phone,
                ]);
            }

            if ($section === 'temporary') {
                $people->update([
                    't_address_line1' => $validated['tAddressLine1'] ?? null,
                    't_address_line2' => $validated['tAddressLine2'] ?? null,
                    't_address_line3' => $validated['tAddressLine3'] ?? null,
                    't_postal_code'   => $validated['tPostalCode'] ?? null,
                ]);
            }

            if ($section === 'current_appointment') {
                EmployerCurrentAppointment::where('employee_id', $people->people_id)->update([
                    'appoint_date' => $validated['currentAppointmentDate'],
                    'service_id'   => $validated['currentAppointmentService'],
                    'rank_id'      => $validated['currentAppointmentRank'],
                    'position_id'  => $validated['currentAppointmentPosition'],
                ]);
            }

            if ($section === 'my_appointment') {
                EmployerAppointment::where('employee_id', $people->people_id)->update([
                    'first_appointment_date' => $validated['firstAppointmentDate'],
                    'appointment_letter_no'  => $validated['firstAppointmentLetter'],
                    'service_id'             => $validated['firstAppointmentService'],
                    'rank_id'                => $validated['firstAppointmentRank'],
                    'position_id'            => $validated['firstAppointmentPosition'],
                    'retirement_date'        => Carbon::parse($people->date_of_birth)->addYears(55)->toDateString(),
                ]);
            }

            if ($section === 'wop') {
                EmployerAppointment::where('employee_id', $people->people_id)->update([
                    'w_op_no' => $validated['w_op_no'],
                    'pay_sheet_no' => $validated['pay_sheet_no'],
                ]);
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'MOE administrator profile updated successfully',
                'data'    => $people,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Update MOE Administrator Profile Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }
}
