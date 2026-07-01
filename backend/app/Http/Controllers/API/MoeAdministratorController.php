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
use App\Models\DivisionalSecretariatOffice;
use App\Models\MinistryOfEducationOffice;
use App\Models\Title;
use App\Models\GenderList;
use App\Models\Religion;
use App\Models\Ethnicity;
use App\Models\CivilStatus;
use App\Models\BloodGroup;
use App\Models\DistrictsList;
use App\Models\Service;
use App\Models\ServiceRank;
use App\Models\TeacherCategory;
use App\Models\RecruitmentCategory;
use App\Models\TeacherType;
use App\Models\ApointedSubject;
use App\Models\MediumOfInstruction;
use App\Models\GnDivision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Services\Wso2IsProvisioningService;

class MoeAdministratorController extends Controller
{
    private const SLEAS_SERVICE_ID  = 'SER005';
    private const MOE_OFFICE_LEVEL = 'OLID001';

    // ==============================
    // HELPERS
    // ==============================

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

    private function resolveRole(string $positionId): string
    {
        $positionName = Position::where('position_id', $positionId)->value('position_name') ?? '';

        $lowerName = strtolower($positionName);

        if (str_contains($lowerName, 'director') || str_contains($lowerName, 'head')) {
            return 'MOE Director';
        }

        return 'MOE Administrator';
    }

    // ==============================
    // LIST
    // ==============================

    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $search  = trim($request->get('search', $request->get('nic', '')));

            $moeAdminPeopleIds = User::query()
                ->whereHas('roles', function ($query) {
                    $query->whereIn('name', ['MOE Director', 'MOE Administrator']);
                })
                ->pluck('people_id');

            $baseQuery = People::query()
                ->whereIn('people_id', $moeAdminPeopleIds);

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
                'appointment',
                'currentAppointment.service',
                'currentAppointment.rank',
                'currentAppointment.position',
                'currentAppointment.workplace',
            ]);

            $admins = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'status'       => 'success',
                'data'         => $admins->items(),
                'total'        => $admins->total(),
                'per_page'     => $admins->perPage(),
                'current_page' => $admins->currentPage(),
                'last_page'    => $admins->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('MOE Admin List Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch MOE admin list',
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
            ])->where('people_id', $people_id)->first();

            if (! $admin) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'MOE admin not found',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $admin,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('MOE Admin Show Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch MOE admin profile',
            ], 500);
        }
    }

    // ==============================
    // FORM DATA
    // ==============================

    public function formData(Request $request)
    {
        $districtId = $request->query('district');
        $dsOfficeId = $request->query('ds_office');
        $serviceId  = $request->query('service');

        $dsOffice = $this->resolveDsOffice($dsOfficeId);
        $dsOfficeDsoId = $dsOffice?->dso_id;

        return response()->json([
            'status' => 'success',

            // Personal drop downs
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

            // First appointment dropdowns
            'teacherCategorys'      => TeacherCategory::active()->get(),
            'recruitmentCategories' => RecruitmentCategory::active()->get(),
            'teacherTypes'          => TeacherType::active()->get(),
            'apointmentSubjects'    => ApointedSubject::active()->orderBy('name_en')->get(),
            'appointmentMedium'     => MediumOfInstruction::active()->get(),

            'services'     => Service::active()->get(),
            'serviceRanks' => $serviceId
                ? ServiceRank::where('service_id', $serviceId)->active()->get()
                : [],
            
            // MOE level dropdowns
            'positions' => Position::active()->get(),
            'moeOffices' => MinistryOfEducationOffice::active()->get(),
        ]);
    }

    public function currentAppointmentFormData(Request $request)
    {
        $service = $request->query('service');

        return response()->json([
            'status' => 'success',
            'ranks' => $service ? ServiceRank::where('service_id', $service)->active()->get() : [],
            'positions' => $service ? Position::where('service_id', $service)->active()->get() : Position::active()->get(),
            'moeOffices' => MinistryOfEducationOffice::active()->get(),
        ]);
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

                // FIRST APPOINTMENT - Removed from UI, now using current appointment details

                // CURRENT APPOINTMENT
                'currentAppointmentDate'         => 'required|date',
                'currentAppointmentLetter'       => 'required|string',
                'currentAppointmentRank'         => 'required|string',
                'currentAppointmentWorkplace'    => 'required|string',
                'currentAppointmentPosition'     => 'required|string',
            ]);

            DB::beginTransaction();

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

            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();
                throw new \Exception('This person already has an active appointment. Cannot register again.');
            }

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
                'office_level_id'         => self::MOE_OFFICE_LEVEL,
                'workplace_id'            => $validated['currentAppointmentWorkplace'],
                'appointment_letter_no'   => $validated['currentAppointmentLetter'],
                'appointment_letter'      => 'none.pdf',
                'recruitment_category_id' => 'RC001', // Default Open General
                'recruitment_subject_id'  => 'EAS001', // Default General
                'active_status'          => 1,
                'is_verified'            => 1,
                'verified_by'            => auth()->user()?->people_id,
                'verified_date'          => now()->toDateTimeString(),
                'is_confirmed'           => 1,
                'confirmed_by'           => auth()->user()?->people_id,
                'confirmed_date'         => now()->toDateTimeString(),
            ]);

            EmployerCurrentAppointment::create([
                'appointment_id'       => $appointmentId,
                'employee_id'          => $people->people_id,
                'appoint_date'         => $validated['currentAppointmentDate'],
                'appointment_letter_no' => $validated['currentAppointmentLetter'],
                'service_id'           => self::SLEAS_SERVICE_ID,
                'rank_id'              => $validated['currentAppointmentRank'],
                'office_level_id'      => self::MOE_OFFICE_LEVEL,
                'position_id'          => $validated['currentAppointmentPosition'],
                'workplace_id'         => $validated['currentAppointmentWorkplace'],
            ]);

            $roleName = $this->resolveRole($validated['currentAppointmentPosition']);

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

            $user->assignRole($roleName);

            DB::commit();

            $wso2Is->provisionUser($user, $defaultPassword, strtolower($roleName));

            $positionName = Position::where('position_id', $validated['currentAppointmentPosition'])
                ->value('position_name');

            return response()->json([
                'status'  => 'success',
                'message' => 'MOE Admin registered successfully',
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
            Log::error('MOE Admin Store Error', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ==============================
    // UPDATE & DELETE
    // ==============================

    public function update(Request $request, $people_id)
    {
        try {
            $people = People::where('people_id', $people_id)->first();
            if (! $people) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'MOE admin not found',
                ], 404);
            }

            $section = (string) $request->input('section');

            if (! in_array($section, ['personal', 'health', 'contact', 'temporary', 'current_appointment', 'my_appointment', 'wop'], true)) {
                return response()->json([
                    'status'  => 'error',
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
                    'phone'        => 'required|string',
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
                    'currentAppointmentService'  => 'required|string',
                    'currentAppointmentRank'     => 'required|string',
                    'currentAppointmentPosition' => 'required|string',
                    'currentAppointmentDate'     => 'required|date',
                ],
                'my_appointment' => [
                    'firstAppointmentDate'     => 'required|date',
                    'firstAppointmentLetter'   => 'required|string',
                    'firstAppointmentService'  => 'required|string',
                    'firstAppointmentRank'     => 'required|string',
                    'firstAppointmentPosition' => 'required|string',
                ],
                'wop' => [
                    'w_op_no'      => 'required|string|max:10',
                    'pay_sheet_no' => 'required|string|max:10',
                ],
            };

            $validated = $request->validate($rules);

            if ($section === 'contact') {
                $email = strtolower(trim((string) $validated['email']));
                $phone = (string) $validated['phone'];

                $emailConflict = People::query()
                    ->where('email', $email)
                    ->where('people_id', '!=', $people_id)
                    ->exists()
                    || User::query()
                        ->where('email', $email)
                        ->where('people_id', '!=', $people_id)
                        ->exists();

                $phoneConflict = People::query()
                    ->where('phone', $phone)
                    ->where('people_id', '!=', $people_id)
                    ->exists()
                    || User::query()
                        ->where('contact', $phone)
                        ->where('people_id', '!=', $people_id)
                        ->exists();

                if ($emailConflict || $phoneConflict) {
                    return response()->json([
                        'status' => 'validation_error',
                        'errors' => array_filter([
                            'email' => $emailConflict ? ['Email is already used by another profile.'] : null,
                            'phone' => $phoneConflict ? ['Phone number is already used by another profile.'] : null,
                        ]),
                    ], 422);
                }
            }

            DB::beginTransaction();

            if ($section === 'personal') {
                $initials = People::generateInitials($validated['fullName']);
                $people->update([
                    'title_id'           => $validated['titleId'],
                    'full_name'          => ucwords(strtolower($validated['fullName'])),
                    'name_with_initials' => $initials,
                    'gender_id'          => $validated['genderId'],
                    'date_of_birth'      => $validated['dateOfBirth'],
                    'ethnicity_id'       => $validated['ethnicityId'],
                    'religion_id'        => $validated['religionId'],
                    'civil_status_id'    => $validated['civilStatusId'],
                ]);

                // Update retirement date if dob changes
                $retirementDate = Carbon::parse($validated['dateOfBirth'])->addYears(60)->toDateString();
                $people->appointment()->update([
                    'retirement_date' => $retirementDate,
                ]);

                User::where('people_id', $people_id)->update([
                    'name' => $initials,
                ]);
            }

            if ($section === 'health') {
                $people->update([
                    'blood_group_id'   => $validated['bloodGroupId'],
                    'health_condition' => (int) $validated['healthCondition'],
                    'health_problem'   => $validated['knownProblems'] ?? null,
                ]);
            }

            if ($section === 'contact') {
                $people->update([
                    'email'          => strtolower(trim((string) $validated['email'])),
                    'phone'          => $validated['phone'],
                    'district_id'    => $validated['districtId'],
                    'ds_office_id'   => $this->resolveDsOfficePrimaryKey((string) $validated['dsOfficeId']),
                    'gn_division_id' => $validated['gnDivisionId'],
                    'address_line1'  => $validated['addressLine1'],
                    'address_line2'  => $validated['addressLine2'],
                    'address_line3'  => $validated['addressLine3'] ?? null,
                    'postal_code'    => $validated['postalCode'],
                ]);

                User::where('people_id', $people_id)->update([
                    'email'   => strtolower(trim((string) $validated['email'])),
                    'contact' => $validated['phone'],
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
                $people->currentAppointment()->update([
                    'appoint_date' => $validated['currentAppointmentDate'],
                    'service_id'   => $validated['currentAppointmentService'],
                    'rank_id'      => $validated['currentAppointmentRank'],
                    'position_id'  => $validated['currentAppointmentPosition'],
                ]);

                $roleName = $this->resolveRole($validated['currentAppointmentPosition']);
                $user = User::where('people_id', $people_id)->first();
                if ($user) {
                    $user->syncRoles([$roleName]);
                }
            }

            if ($section === 'my_appointment') {
                $people->appointment()->update([
                    'first_appointment_date' => $validated['firstAppointmentDate'],
                    'appointment_letter_no'  => $validated['firstAppointmentLetter'],
                    'service_id'             => $validated['firstAppointmentService'],
                    'rank_id'                => $validated['firstAppointmentRank'],
                    'position_id'            => $validated['firstAppointmentPosition'],
                ]);
            }

            if ($section === 'wop') {
                $people->appointment()->update([
                    'w_op_no'      => $validated['w_op_no'],
                    'pay_sheet_no' => $validated['pay_sheet_no'],
                ]);
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'MOE admin updated successfully',
                'data'    => $people->fresh(),
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('MOE Admin Update Error', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to update MOE admin',
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
                'message' => 'MOE admin deactivated successfully',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('MOE Admin Delete Error', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to deactivate MOE admin',
            ], 500);
        }
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

        $allowed = ['super admin', 'moe director', 'moe administrator'];
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
            Log::error('Add MOE Service History Entry Error', [
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

        $allowed = ['super admin', 'moe director', 'moe administrator'];
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
            Log::error('Add MOE Past Service Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }
}
