<?php

namespace App\Http\Controllers\API;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Title;
use App\Models\People;
use App\Models\Position;
use App\Models\Religion;
use App\Models\Ethnicity;
use App\Helpers\NicHelper;
use App\Models\BloodGroup;
use App\Models\GenderList;
use App\Models\GnDivision;
use App\Models\CivilStatus;
use App\Models\Service;
use App\Models\ServiceRank;
use App\Models\DistrictsList;
use App\Models\EmployerAppointment;
use App\Models\EmployerAppointmentHistory;
use App\Models\EmployerCurrentAppointment;
use App\Models\ProvincialEducationOffice;
use App\Models\ProvincialMinistryOfEducationOffice;
use App\Models\DivisionalSecretariatOffice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Services\Wso2IsProvisioningService;

class ProvincialDeoController extends Controller
{
    private const GENERAL_SERVICE_ID = 'SER007';
    private const PROVINCIAL_PEO_LEVEL = 'OLID003';

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

    private function resolveDsOfficeDsoId(?string $value): ?string
    {
        return $this->resolveDsOffice($value)?->dso_id;
    }

    private function resolveDsOfficePrimaryKey(?string $value): ?int
    {
        return $this->resolveDsOffice($value)?->id;
    }

    // ==========================================
    // FORM DATA
    // ==========================================

    public function formData(Request $request)
    {
        $districtId = $request->query('district');
        $dsOfficeDsoId = $this->resolveDsOfficeDsoId($request->query('ds_office'));
        $serviceId  = $request->query('service');

        return response()->json([
            'status' => 'success',

            'titles'       => Title::active()->get(),
            'genders'      => GenderList::active()->get(),
            'religions'    => Religion::active()->get(),
            'ethnicities'  => Ethnicity::active()->get(),
            'civilStatuses' => CivilStatus::active()->get(),
            'bloodGroups'  => BloodGroup::all(),
            'districts'    => DistrictsList::active()->get(),

            'divisionalSecretariats' => $districtId
                ? DivisionalSecretariatOffice::where('district_id', $districtId)->active()->get()
                : [],

            'gnDivisions' => $dsOfficeDsoId
                ? GnDivision::where('dso_id', $dsOfficeDsoId)->active()->get()
                : [],

            'services'     => Service::active()->get(),
            'serviceRanks' => $serviceId
                ? ServiceRank::where('service_id', $serviceId)->active()->get()
                : [],
            'positions'    => Position::where('position_name', 'Development Officer')->active()->get(),

            'provincialOffices' => ProvincialEducationOffice::active()->get(),
            'provincialMinistries' => ProvincialMinistryOfEducationOffice::active()->get(),
        ]);
    }

    public function currentAppointmentFormData(Request $request)
    {
        $service = $request->query('service');

        $positions = $service
            ? Position::where('service_id', $service)->active()->get()
            : Position::where('position_name', 'Development Officer')->active()->get();

        return response()->json([
            'status' => 'success',
            'service' => Service::active()->get(),
            'serviceRanks' => $service ? ServiceRank::where('service_id', $service)->active()->get() : [],
            'positions' => $positions,
            'provincialOffices' => ProvincialEducationOffice::active()->get(),
            'provincialMinistries' => ProvincialMinistryOfEducationOffice::active()->get(),
        ]);
    }

    // ==========================================
    // LIST
    // ==========================================

    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $provWpId = $request->get('provincial_wp_id');
            $search  = trim($request->get('search', $request->get('nic', '')));

            $deoOfficerPeopleIds = User::query()
                ->whereHas('roles', function ($query) {
                    $query->whereIn('name', ['Provincial DEO', 'Provincial Clerk (DEO)']);
                })
                ->pluck('people_id');

            $baseQuery = People::query()
                ->whereIn('people_id', $deoOfficerPeopleIds)
                ->when($provWpId, function ($q) use ($provWpId) {
                    $q->whereHas('currentAppointment', function ($q2) use ($provWpId) {
                        $q2->where('workplace_id', $provWpId);
                    });
                });

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

            $officers = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $data = collect($officers->items())->map(function (People $person) {
                $arr = $person->toArray();
                $arr['confirmed'] = $person->myAppointments->contains(fn($a) => (int) $a->is_confirmed === 1);
                return $arr;
            })->values();

            return response()->json([
                'status'       => 'success',
                'data'         => $data,
                'total'        => $officers->total(),
                'per_page'     => $officers->perPage(),
                'current_page' => $officers->currentPage(),
                'last_page'    => $officers->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Provincial DEO Officer List Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch Provincial DEO officer list',
            ], 500);
        }
    }

    // ==========================================
    // SHOW
    // ==========================================

    public function show($people_id)
    {
        try {
            $officer = People::with([
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
            ])->where('people_id', $people_id)->first();

            if (! $officer) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Provincial DEO officer not found',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $officer,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Provincial DEO Show Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch Provincial DEO profile',
            ], 500);
        }
    }

    // ==========================================
    // STORE
    // ==========================================

    public function store(Request $request, Wso2IsProvisioningService $wso2Is)
    {
        try {
            $validated = $request->validate([
                // PERSONAL
                'nic'                        => 'required|string',
                'titleId'                    => 'required|string',
                'fullName'                   => 'required|string',
                'dateOfBirth'                => 'required|date',
                'genderId'                   => 'required|string',
                'religionId'                 => 'required|string',
                'ethnicityId'                => 'required|string',
                'civilStatusId'              => 'required|string',
                'bloodGroupId'               => 'required|string',
                'healthCondition'            => 'required',
                'healthConditionDescription' => 'nullable|string',
                'districtId'                 => 'required|string',
                'gnDivisionId'               => 'required|string',
                'dsOfficeId'                 => 'required|string',

                // CONTACT
                'email'        => 'required|email',
                'contact'      => 'required|string',
                'addressLine1' => 'required|string',
                'addressLine2' => 'required|string',
                'addressLine3' => 'nullable|string',
                'postalCode'   => 'required|string',

                // APPOINTMENT
                'appointmentDate'     => 'required|date',
                'appointmentLetter'   => 'required|string',
                'rankId'              => 'required|string',
                'positionId'          => 'required|string',
                'provincialOfficeId'  => 'required|string',
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
                    'address_line3'      => $validated['addressLine3'] ?? null,
                    'postal_code'        => $validated['postalCode'],
                    'profile_picture'    => 'default.png',
                ]
            );

            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();
                throw new \Exception('This person already has an active appointment. Cannot register again.');
            }

            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(60);
            $appointmentId  = EmployerAppointment::generateAppointmentId($validated['appointmentDate']);

            EmployerAppointment::create([
                'appointment_id'          => $appointmentId,
                'employee_id'             => $people->people_id,
                'first_appointment_date'  => $validated['appointmentDate'],
                'retirement_date'         => $retirementDate->toDateString(),
                'service_id'              => self::GENERAL_SERVICE_ID,
                'rank_id'                 => $validated['rankId'],
                'position_id'             => $validated['positionId'],
                'office_level_id'         => self::PROVINCIAL_PEO_LEVEL,
                'workplace_id'            => $validated['provincialOfficeId'],
                'appointment_letter_no'   => $validated['appointmentLetter'],
                'appointment_letter'      => 'none.pdf',
                'active_status'          => 1,
                'is_verified'            => 1,
                'verified_by'            => auth()->user()?->people_id,
                'verified_date'          => now()->toDateTimeString(),
                'is_confirmed'           => 1,
                'confirmed_by'           => auth()->user()?->people_id,
                'confirmed_date'         => now()->toDateTimeString(),
            ]);

            // Determine Office Level from Workplace
            $officeLevelId = DB::table('workplaces')
                ->where('workplace_id', $validated['provincialOfficeId'])
                ->value('office_level_id') ?? self::PROVINCIAL_PEO_LEVEL;

            EmployerCurrentAppointment::create([
                'appointment_id'       => $appointmentId,
                'employee_id'          => $people->people_id,
                'appoint_date'         => $validated['appointmentDate'],
                'appointment_letter_no' => $validated['appointmentLetter'],
                'service_id'           => self::GENERAL_SERVICE_ID,
                'rank_id'              => $validated['rankId'],
                'office_level_id'      => $officeLevelId,
                'position_id'          => $validated['positionId'],
                'workplace_id'         => $validated['provincialOfficeId'],
            ]);

            $roleName = 'Provincial DEO';

            $user = User::create([
                'nic'                      => $nic,
                'nic_hash'                 => NicHelper::hash($nic),
                'people_id'                => $people->people_id,
                'name'                     => $people->name_with_initials,
                'email'                    => strtolower($validated['email']),
                'contact'                  => $validated['contact'],
                'password'                 => Hash::make('Password@123'),
                'identity_provider'        => 'local',
                'active_status'            => true,
                'must_change_password'     => true,
                'password_initialized_at'  => now(),
                'password_changed_at'      => null,
                'default_password_version' => 1,
            ]);

            $user->assignRole($roleName);

            DB::commit();

            $wso2Is->provisionUser($user, 'Password@123', strtolower($roleName));

            $positionName = Position::where('position_id', $validated['positionId'])
                ->value('position_name');

            return response()->json([
                'status'  => 'success',
                'message' => 'Provincial DEO registered successfully',
                'data'    => [
                    'name'                         => $people->full_name,
                    'fullName'                     => $people->full_name,
                    'nic'                          => $people->nic,
                    'email'                        => $people->email,
                    'contact'                      => $people->phone,
                    'role'                         => $roleName,
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
            Log::error('Provincial DEO Store Error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $people_id)
    {
        try {
            $validated = $request->validate([
                'fullName'                   => 'required|string',
                'titleId'                    => 'required|string',
                'genderId'                   => 'required|string',
                'dateOfBirth'                => 'required|date',
                'religionId'                 => 'required|string',
                'ethnicityId'                => 'required|string',
                'civilStatusId'              => 'required|string',
                'bloodGroupId'               => 'required|string',
                'healthCondition'            => 'required',
                'healthConditionDescription' => 'nullable|string',
                'districtId'                 => 'required|string',
                'gnDivisionId'               => 'required|string',
                'dsOfficeId'                 => 'required|string',

                'email'        => 'required|email',
                'contact'      => 'required|string',
                'addressLine1' => 'required|string',
                'addressLine2' => 'required|string',
                'addressLine3' => 'nullable|string',
                'postalCode'   => 'required|string',
            ]);

            $people = People::where('people_id', $people_id)->first();
            if (! $people) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Provincial DEO not found',
                ], 404);
            }

            DB::beginTransaction();

            $initials = People::generateInitials($validated['fullName']);

            $people->update([
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
            ]);

            User::where('people_id', $people_id)->update([
                'name'    => $initials,
                'email'   => strtolower($validated['email']),
                'contact' => $validated['contact'],
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Provincial DEO updated successfully',
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
            Log::error('Provincial DEO Update Error', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to update Provincial DEO',
            ], 500);
        }
    }

    public function destroy($people_id)
    {
        try {
            $user = User::where('people_id', $people_id)->first();
            if ($user) {
                $user->active_status = false;
                $user->save();
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Provincial DEO deactivated successfully',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Provincial DEO Delete Error', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to deactivate Provincial DEO',
            ], 500);
        }
    }

    // ==========================================
    // SERVICE HISTORY
    // ==========================================

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
            Log::error('Add Provincial DEO Service History Entry Error', [
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
            Log::error('Add Provincial DEO Past Service Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }
}
