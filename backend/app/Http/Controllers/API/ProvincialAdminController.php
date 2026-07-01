<?php

namespace App\Http\Controllers\API;

use Carbon\Carbon;
use App\Models\User;
use App\Models\People;
use App\Models\Position;
use App\Helpers\NicHelper;
use App\Models\EmployerAppointment;
use App\Models\EmployerAppointmentHistory;
use App\Models\EmployerCurrentAppointment;
use App\Models\ServiceRank;
use App\Models\ProvincialEducationOffice;
use App\Models\ProvincialMinistryOfEducationOffice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Services\Wso2IsProvisioningService;

class ProvincialAdminController extends Controller
{
    private const SLEAS_SERVICE_ID  = 'SER005';
    private const PROVINCIAL_PEO_LEVEL = 'OLID003';

    public function currentAppointmentFormData(Request $request)
    {
        $service = $request->query('service');

        $peoOffices = ProvincialEducationOffice::active()->get();
        $pmoeOffices = ProvincialMinistryOfEducationOffice::active()->get();

        $combinedOffices = $peoOffices->concat($pmoeOffices)->map(function ($office) {
            return [
                'workplace_id' => $office->workplace_id,
                'name' => $office->name,
            ];
        });

        return response()->json([
            'status' => 'success',
            'ranks' => $service ? ServiceRank::where('service_id', $service)->active()->get() : [],
            'positions' => $service ? Position::where('service_id', $service)->active()->get() : Position::active()->get(),
            'provincialOffices' => $combinedOffices,
        ]);
    }

    // ==============================
    // HELPERS
    // ==============================

    private function resolveRole(string $positionId): string
    {
        $positionName = Position::where('position_id', $positionId)->value('position_name') ?? '';

        $lowerName = strtolower($positionName);

        if (str_contains($lowerName, 'deputy')) {
            return 'Provincial Deputy Director';
        }

        if (str_contains($lowerName, 'assistant') || str_contains($lowerName, 'subject')) {
            return 'Provincial Subject Head';
        }

        return 'Provincial Director';
    }

    // ==============================
    // LIST
    // ==============================

    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $search  = trim($request->get('search', $request->get('nic', '')));

            $provAdminPeopleIds = User::query()
                ->whereHas('roles', function ($query) {
                    $query->whereIn('name', ['Provincial Director', 'Provincial Deputy Director', 'Provincial Subject Head']);
                })
                ->pluck('people_id');

            $baseQuery = People::query()
                ->whereIn('people_id', $provAdminPeopleIds);

            $query = clone $baseQuery;

            if ($search !== '') {
                $isNicSearch = is_numeric(substr($search, 0, 1));

                if ($isNicSearch) {
                    $matchedPeopleIds = (clone $baseQuery)
                        ->select(['people_id', 'nic'])
                        ->get()
                        ->filter(function (People $person) use ($search) {
                            return str_contains((string) $person->nic, $search);
                        })
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

            $query = $query->with([
                'title',
                'gender',
                'myAppointments',
                'currentAppointment.service',
                'currentAppointment.rank',
                'currentAppointment.position',
                'currentAppointment.workplace',
            ]);

            $admins = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $data = collect($admins->items())->map(function (People $person) {
                $arr = $person->toArray();
                $arr['confirmed'] = $person->myAppointments->contains(fn($a) => (int) $a->is_confirmed === 1);
                return $arr;
            })->values();

            return response()->json([
                'status'       => 'success',
                'data'         => $data,
                'total'        => $admins->total(),
                'per_page'     => $admins->perPage(),
                'current_page' => $admins->currentPage(),
                'last_page'    => $admins->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Provincial Admin List Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch Provincial admin list',
            ], 500);
        }
    }

    // ==============================
    // SHOW
    // ==============================

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
            ])->where(function ($query) use ($people_id) {
                $query->where('people_id', $people_id)
                      ->orWhere('id', $people_id);
            })->first();

            if (! $admin) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Provincial admin not found',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $admin,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Provincial Admin Show Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch Provincial admin profile',
            ], 500);
        }
    }

    // ==============================
    // STORE
    // ==============================

    public function store(Request $request, Wso2IsProvisioningService $wso2Is)
    {
        try {
            $validated = $request->validate([
                // PERSONAL
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

                // CONTACT
                'email'        => 'required|email',
                'contact'      => 'required|string',
                'addressLine1' => 'required|string',
                'addressLine2' => 'required|string',
                'addressLine3' => 'nullable|string',
                'postalCode'   => 'required|string',

                // CURRENT APPOINTMENT
                'currentAppointmentDate'         => 'required|date',
                'currentAppointmentLetter'       => 'required|string',
                'currentAppointmentRank'         => 'required|string',
                'currentAppointmentWorkplace'    => 'required|string',
                'currentAppointmentPosition'     => 'required|string',
            ]);

            // Check if email or phone is already taken (BUG-016 Fix)
            $email = strtolower(trim($validated['email']));
            $phone = trim($validated['contact']);

            $emailExists = People::where('email', $email)->exists() || User::where('email', $email)->exists();
            $phoneExists = People::where('phone', $phone)->exists() || User::where('contact', $phone)->exists();

            if ($emailExists || $phoneExists) {
                $errors = [];
                if ($emailExists) {
                    $errors['email'] = ['Email is already used by another profile.'];
                }
                if ($phoneExists) {
                    $errors['contact'] = ['Phone number is already used by another profile.'];
                }
                return response()->json([
                    'status' => 'validation_error',
                    'message' => 'Validation failed',
                    'errors' => $errors
                ], 422);
            }

            DB::beginTransaction();

            // ==============================
            // PEOPLE
            // ==============================
            $nic      = NicHelper::normalize($validated['nic']);
            $defaultPassword = 'Pw' . $nic;
            $initials = People::generateInitials($validated['fullName']);

            $people = People::updateOrCreate(
                ['nic_hash' => NicHelper::hash($nic)],
                [
                    'nic'              => $nic,
                    'title_id'         => $validated['titleId'],
                    'full_name'        => ucwords(strtolower($validated['fullName'])),
                    'name_with_initials' => $initials,
                    'gender_id'        => $validated['genderId'],
                    'date_of_birth'    => $validated['dateOfBirth'],
                    'religion_id'      => $validated['religionId'],
                    'ethnicity_id'     => $validated['ethnicityId'],
                    'civil_status_id'  => $validated['civilStatusId'],
                    'blood_group_id'   => $validated['bloodGroupId'],
                    'health_condition' => $validated['healthCondition'],
                    'health_problem'   => $validated['healthConditionDescription'],
                    'district_id'      => $validated['districtId'],
                    'gn_division_id'   => $validated['gnDivisionId'],
                    'ds_office_id'     => $this->resolveDsOfficePrimaryKey($validated['dsOfficeId']),
                    'email'            => strtolower($validated['email']),
                    'phone'            => $validated['contact'],
                    'address_line1'    => $validated['addressLine1'],
                    'address_line2'    => $validated['addressLine2'],
                    'address_line3'    => $validated['addressLine3'],
                    'postal_code'      => $validated['postalCode'],
                    'profile_picture'  => 'default.png',
                ]
            );

            // ==============================
            // GUARD: DUPLICATE APPOINTMENT
            // ==============================
            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();

                throw new \Exception('This person already has an active appointment. Cannot register again.');
            }

            // Determine Office Level from Workplace
            $officeLevelId = DB::table('workplaces')
                ->where('workplace_id', $validated['currentAppointmentWorkplace'])
                ->value('office_level_id') ?? self::PROVINCIAL_PEO_LEVEL;

            // ==============================
            // FIRST APPOINTMENT
            // ==============================
            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(60);
            $appointmentId  = EmployerAppointment::generateAppointmentId($validated['currentAppointmentDate']);

            EmployerAppointment::create([
                'appointment_id'          => $appointmentId,
                'employee_id'             => $people->people_id,
                'first_appointment_date'  => $validated['currentAppointmentDate'],
                'retirement_date'         => $retirementDate->toDateString(),
                'service_id'              => self::SLEAS_SERVICE_ID,
                'rank_id'                 => $validated['currentAppointmentRank'],
                'position_id'             => $validated['currentAppointmentPosition'],
                'office_level_id'         => $officeLevelId,
                'workplace_id'            => $validated['currentAppointmentWorkplace'],
                'appointment_letter_no'   => $validated['currentAppointmentLetter'],
                'appointment_letter'      => 'none.pdf',
                'recruitment_category_id' => 'RC001',
                'recruitment_subject_id'  => 'EAS001',
                'active_status'          => 1,
                'is_verified'            => 1,
                'verified_by'            => auth()->user()?->people_id,
                'verified_date'          => now()->toDateTimeString(),
                'is_confirmed'           => 1,
                'confirmed_by'           => auth()->user()?->people_id,
                'confirmed_date'         => now()->toDateTimeString(),
            ]);

            // ==============================
            // CURRENT APPOINTMENT
            // ==============================
            EmployerCurrentAppointment::create([
                'appointment_id'       => $appointmentId,
                'employee_id'          => $people->people_id,
                'appoint_date'         => $validated['currentAppointmentDate'],
                'appointment_letter_no' => $validated['currentAppointmentLetter'],
                'service_id'           => self::SLEAS_SERVICE_ID,
                'rank_id'              => $validated['currentAppointmentRank'],
                'office_level_id'      => $officeLevelId,
                'position_id'          => $validated['currentAppointmentPosition'],
                'workplace_id'         => $validated['currentAppointmentWorkplace'],
            ]);

            // ==============================
            // SYSTEM USER
            // ==============================
            $role = $this->resolveRole($validated['currentAppointmentPosition']);

            $user = User::create([
                'nic'                      => $nic,
                'nic_hash'                 => NicHelper::hash($nic),
                'people_id'                => $people->people_id,
                'name'                     => $people->name_with_initials,
                'email'                    => strtolower($validated['email']),
                'contact'                  => $validated['contact'],
                'password'                 => Hash::make($defaultPassword),
                'identity_provider'        => 'local',
                'active_status'            => true,
                'must_change_password'     => true,
                'password_initialized_at'  => now(),
                'password_changed_at'      => null,
                'default_password_version' => 1,
            ]);

            $user->assignRole($role);

            DB::commit();

            $wso2Is->provisionUser($user, $defaultPassword, strtolower($role));

            $positionName = Position::where('position_id', $validated['currentAppointmentPosition'])
                ->value('position_name');

            return response()->json([
                'status'  => 'success',
                'message' => 'Provincial education administrator registered successfully',
                'data'    => [
                    'name'                         => $people->full_name,
                    'fullName'                     => $people->full_name,
                    'nic'                          => $people->nic,
                    'email'                        => $people->email,
                    'contact'                      => $people->phone,
                    'role'                         => $role,
                    'currentAppointmentPositionName' => $positionName,
                ],
                'people_id'        => $people->people_id,
                'default_password' => $defaultPassword,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('ProvincialAdmin Store Error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function resolveDsOfficePrimaryKey(?string $value): ?int
    {
        if (empty($value)) return null;
        if (ctype_digit($value)) {
            return (int) $value;
        }
        return DB::table('divisional_secretariat_offices')->where('dso_id', $value)->value('id');
    }

    // ==============================
    // SERVICE HISTORY
    // ==============================

    public function addServiceHistoryEntry(Request $request, string $id)
    {
        $jwtRoles = (array) $request->attributes->get('jwt_roles', []);
        $dbRoles  = $request->user()?->getRoleNames()?->all() ?? [];
        $roles    = array_unique(array_merge(
            array_map('strtolower', $jwtRoles),
            array_map('strtolower', $dbRoles),
        ));

        $allowed = ['super admin', 'provincial director', 'provincial deputy director', 'provincial subject head', 'provincial deo'];
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
            Log::error('Add Provincial Admin Service History Entry Error', [
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

        $allowed = ['super admin', 'provincial director', 'provincial deputy director', 'provincial subject head', 'provincial deo'];
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

            $retirementDate = Carbon::parse($person->date_of_birth)->addYears(60);

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
            Log::error('Add Provincial Admin Past Service Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }
}
