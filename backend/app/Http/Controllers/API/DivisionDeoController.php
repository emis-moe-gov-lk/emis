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
use App\Models\Institution;
use App\Models\ZonalEducationOffice;
use App\Models\InstitutionCategory;
use App\Models\DistrictsList;
use App\Models\EmployerAppointment;
use App\Models\EmployerAppointmentHistory;
use App\Models\EmployerCurrentAppointment;
use App\Models\DivisionalEducationOffice;
use App\Models\DivisionalSecretariatOffice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Services\Wso2IsProvisioningService;

class DivisionDeoController extends Controller
{
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

            'divisionalOffices' => DivisionalEducationOffice::active()->get(),
        ]);
    }

    public function currentAppointmentFormData(Request $request)
    {
        $service = $request->query('service');
        $institutionCategory = $request->query('ins_cat');
        $zone = $request->query('zone');

        $positions = $service
            ? Position::where('service_id', $service)->active()->get()
            : Position::where('position_name', 'Development Officer')->active()->get();

        $roles = $request->attributes->get('jwt_roles', []);
        $isSuperAdmin = in_array('super admin', $roles);

        if ($isSuperAdmin) {
            $divisionalOffices = DivisionalEducationOffice::active()->get();
        } else {
            $workplaceId = auth()->user()?->currentAppointment?->workplace_id;

            $deo = DivisionalEducationOffice::where('workplace_id', $workplaceId)->active()->first();

            if ($deo) {
                $divisionalOffices = collect([$deo]);
            } else {
                // If Zonal user, they might see all divisions under their zone
                $zeo = ZonalEducationOffice::where('workplace_id', $workplaceId)->active()->first();
                if ($zeo) {
                    $divisionalOffices = DivisionalEducationOffice::where('zeo_wp_id', $zeo->workplace_id)->active()->get();
                } else {
                    $divisionalOffices = collect();
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'service' => Service::active()->get(),
            'serviceRanks' => $service ? ServiceRank::where('service_id', $service)->active()->get() : [],
            'positions' => $positions,
            'institutionCategory' => InstitutionCategory::active()->get(),
            'divisionalEducationOffices' => $divisionalOffices,
            'institutions' => $zone && $institutionCategory
                ? Institution::where('zeo_wp_id', $zone)->where('institution_category_id', $institutionCategory)->get()
                : [],
        ]);
    }
 
    // ==========================================
    // LIST
    // ==========================================

    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $deoWpId = $request->get('deo_wp_id');
            $search  = trim($request->get('search', $request->get('nic', '')));

            $deoOfficerPeopleIds = User::query()
                ->whereHas('roles', function ($query) {
                    $query->whereIn('name', ['Divisional DEO', 'Divisional DEO HEAD']);
                })
                ->pluck('people_id');

            $baseQuery = People::query()
                ->whereIn('people_id', $deoOfficerPeopleIds)
                ->when($deoWpId, function ($q) use ($deoWpId) {
                    $q->whereHas('currentAppointment', function ($q2) use ($deoWpId) {
                        $q2->where('workplace_id', $deoWpId);
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
            Log::error('Divisional DEO Officer List Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch Divisional DEO officer list',
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
                    'message' => 'Divisional DEO officer not found',
                ], 404);
            }

            if ($officer->currentAppointment?->workplace) {
                $officer->currentAppointment->workplace->append(['office_name', 'address']);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $officer,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Divisional DEO Officer Show Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch Divisional DEO officer',
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

        $allowed = ['super admin', 'divisional director', 'divisional deputy director', 'divisional deo', 'divisional deo head'];
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
            Log::error('Add Divisional DEO Service History Entry Error', [
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

        $allowed = ['super admin', 'divisional director', 'divisional deputy director', 'divisional deo', 'divisional deo head'];
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
            Log::error('Add Divisional DEO Past Service Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }

    // ==========================================
    // CREATE
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
                'divisionalOfficeId'  => 'required|string',
            ]);

            DB::beginTransaction();

            $nic        = NicHelper::normalize($validated['nic']);
            $initials   = People::generateInitials($validated['fullName']);
            $dosService = Service::where('service_name', 'DOS')->firstOrFail();
            $serviceId  = $dosService->service_id;

            // ---- PEOPLE ----
            
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

            // ---- GUARD ----
            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();

                return response()->json([
                    'status'  => 'error',
                    'message' => 'This person already has an active appointment.',
                ], 409);
            }

            // ---- APPOINTMENT ----
            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(55);
            $appointmentId  = EmployerAppointment::generateAppointmentId($validated['appointmentDate']);

            EmployerAppointment::create([
                'appointment_id'         => $appointmentId,
                'employee_id'            => $people->people_id,
                'first_appointment_date' => $validated['appointmentDate'],
                'retirement_date'        => $retirementDate->toDateString(),
                'service_id'             => $serviceId,
                'rank_id'               => $validated['rankId'],
                'position_id'            => $validated['positionId'],
                'office_level_id'        => 'OLID005',
                'workplace_id'           => $validated['divisionalOfficeId'],
                'appointment_letter_no'  => $validated['appointmentLetter'],
                'appointment_letter'     => 'none.pdf',
                'active_status'          => 1,
                'is_verified'            => 1,
                'verified_by'            => auth()->user()?->people_id,
                'verified_date'          => now()->toDateTimeString(),
                'is_confirmed'           => 1,
                'confirmed_by'           => auth()->user()?->people_id,
                'confirmed_date'         => now()->toDateTimeString(),
            ]);

            // ---- CURRENT APPOINTMENT ----
            EmployerCurrentAppointment::create([
                'appointment_id'  => $appointmentId,
                'employee_id'     => $people->people_id,
                'appoint_date'    => $validated['appointmentDate'],
                'service_id'      => $serviceId,
                'rank_id'         => $validated['rankId'],
                'office_level_id' => 'OLID005',
                'position_id'     => $validated['positionId'],
                'workplace_id'    => $validated['divisionalOfficeId'],
            ]);

            // ---- USER ----
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

            $user->assignRole('Divisional DEO');

            DB::commit();

            $wso2Is->provisionUser($user, 'Password@123', 'divisional deo');

            return response()->json([
                'status'           => 'success',
                'message'          => 'Divisional DEO officer created successfully',
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
            Log::error('Divisional DEO Officer Store Error', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Internal server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ==========================================
    // UPDATE
    // ==========================================

    public function update(Request $request, $people_id)
    {
        try {
            $people = People::where('people_id', $people_id)->first();

            if (! $people) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Divisional DEO officer not found',
                ], 404);
            }

            $validated = $request->validate([
                // PERSONAL
                'titleId'                    => 'sometimes|string',
                'fullName'                   => 'sometimes|string',
                'dateOfBirth'                => 'sometimes|date',
                'genderId'                   => 'sometimes|string',
                'religionId'                 => 'sometimes|string',
                'ethnicityId'                => 'sometimes|string',
                'civilStatusId'              => 'sometimes|string',
                'bloodGroupId'               => 'sometimes|string',
                'healthCondition'            => 'sometimes',
                'healthConditionDescription' => 'nullable|string',
                'districtId'                 => 'sometimes|string',
                'gnDivisionId'               => 'sometimes|string',
                'dsOfficeId'                 => 'sometimes|string',

                // CONTACT
                'email'        => 'sometimes|email',
                'contact'      => 'sometimes|string',
                'addressLine1' => 'sometimes|string',
                'addressLine2' => 'sometimes|string',
                'addressLine3' => 'nullable|string',
                'postalCode'   => 'sometimes|string',

                // CURRENT APPOINTMENT
                'serviceId'          => 'sometimes|string',
                'rankId'             => 'sometimes|string',
                'positionId'         => 'sometimes|string',
                'divisionalOfficeId' => 'sometimes|string',
            ]);

            DB::beginTransaction();

            // ---- UPDATE PEOPLE ----
            $peopleData = array_filter([
                'title_id'        => $validated['titleId'] ?? null,
                'full_name'       => isset($validated['fullName']) ? ucwords(strtolower($validated['fullName'])) : null,
                'name_with_initials' => isset($validated['fullName']) ? People::generateInitials($validated['fullName']) : null,
                'gender_id'       => $validated['genderId'] ?? null,
                'date_of_birth'   => $validated['dateOfBirth'] ?? null,
                'religion_id'     => $validated['religionId'] ?? null,
                'ethnicity_id'    => $validated['ethnicityId'] ?? null,
                'civil_status_id' => $validated['civilStatusId'] ?? null,
                'blood_group_id'  => $validated['bloodGroupId'] ?? null,
                'health_condition' => $validated['healthCondition'] ?? null,
                'health_problem'  => $validated['healthConditionDescription'] ?? null,
                'district_id'     => $validated['districtId'] ?? null,
                'gn_division_id'  => $validated['gnDivisionId'] ?? null,
                'ds_office_id'    => isset($validated['dsOfficeId'])
                    ? $this->resolveDsOfficePrimaryKey($validated['dsOfficeId'])
                    : null,
                'email'           => isset($validated['email']) ? strtolower($validated['email']) : null,
                'phone'           => $validated['contact'] ?? null,
                'address_line1'   => $validated['addressLine1'] ?? null,
                'address_line2'   => $validated['addressLine2'] ?? null,
                'address_line3'   => $validated['addressLine3'] ?? null,
                'postal_code'     => $validated['postalCode'] ?? null,
            ], fn ($v) => ! is_null($v));

            if (! empty($peopleData)) {
                $people->update($peopleData);
            }

            // ---- UPDATE CURRENT APPOINTMENT ----
            $appointmentData = array_filter([
                'service_id'   => $validated['serviceId'] ?? null,
                'rank_id'      => $validated['rankId'] ?? null,
                'position_id'  => $validated['positionId'] ?? null,
                'workplace_id' => $validated['divisionalOfficeId'] ?? null,
            ], fn ($v) => ! is_null($v));

            if (! empty($appointmentData)) {
                EmployerCurrentAppointment::where('employee_id', $people->people_id)
                    ->update($appointmentData);
            }

            // ---- UPDATE USER email/contact ----
            $userUpdate = array_filter([
                'email'   => isset($validated['email']) ? strtolower($validated['email']) : null,
                'contact' => $validated['contact'] ?? null,
            ], fn ($v) => ! is_null($v));

            if (! empty($userUpdate)) {
                User::where('people_id', $people->people_id)->update($userUpdate);
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Divisional DEO officer updated successfully',
            ], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Divisional DEO Officer Update Error', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Internal server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ==========================================
    // DEACTIVATE
    // ==========================================

    public function destroy($people_id)
    {
        try {
            $people = People::where('people_id', $people_id)->first();

            if (! $people) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Divisional DEO officer not found',
                ], 404);
            }

            $user = User::where('people_id', $people->people_id)->first();

            if (! $user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Divisional DEO officer not found',
                ], 404);
            }

            $user->update(['active_status' => false]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Divisional DEO officer deactivated successfully',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Divisional DEO Officer Destroy Error', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Internal server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
