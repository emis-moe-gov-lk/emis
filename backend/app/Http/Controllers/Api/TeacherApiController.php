<?php

namespace App\Http\Controllers\API;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Title;
use App\Models\People;
use App\Models\Service;

use App\Models\Teacher;
use App\Models\Position;
use App\Models\Religion;
use App\Models\Ethnicity;
use App\Helpers\NicHelper;

use App\Models\BloodGroup;
use App\Models\GenderList;
use App\Models\GnDivision;
use App\Models\CivilStatus;
use App\Models\Institution;
use App\Models\ServiceRank;
use App\Models\SubjectList;
use App\Models\TeacherType;
use Illuminate\Http\Request;
use App\Models\DistrictsList;
use App\Models\ApointedSubject;
use App\Models\TeacherCategory;
use Illuminate\Support\Facades\DB;
use App\Services\TeacherEligibilityService;
use App\Models\EmployerAppointment;
use App\Models\InstitutionCategory;
use App\Models\MediumOfInstruction;

use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\In;
use App\Http\Controllers\Controller;
use App\Models\DivisionalEducationOffice;
use App\Models\ZonalEducationOffice;
use Illuminate\Support\Facades\Hash;
use App\Models\EmployerCurrentAppointment;
use App\Models\DivisionalSecretariatOffice;


use Illuminate\Validation\ValidationException;

class TeacherApiController extends Controller
{
    public function index()
    {
        return response()->json([
            "status" => "success",

            "titles" => Title::active()->get(),
            "genders" => GenderList::active()->get(),
            "religions" => Religion::active()->get(),
            "ethnicities" => Ethnicity::active()->get(),
            "civil_statuses" => CivilStatus::active()->get(),
            "blood_groups" => BloodGroup::all(),
            "districts" => DistrictsList::active()->get(),

            // Services
            "services" => Service::active()->get(),
            "service_ranks" => ServiceRank::active()->get(),

            // Teacher settings
            "teacher_categories" => TeacherCategory::active()->get(),
            "teacher_types" => TeacherType::active()->get(),

            // Subjects
            "subjects" => SubjectList::active()->orderBy('name_en')->get(),
            "appointed_subjects" => ApointedSubject::active()->orderBy('name_en')->get(),

            // Medium
            "mediums" => MediumOfInstruction::active()->get(),
        ]);
    }

    public function teacherList(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $nic     = trim($request->get('nic'));
            $roles   = $request->attributes->get('jwt_roles', []);

            $baseQuery = People::query()->whereHas('teacher');

            // DEO officer: scope to teachers in institutions under their division
            if (in_array('development officer', $roles)) {
                $deoWorkplaceId = auth()->user()?->currentAppointment?->workplace_id;

                $institutionWorkplaceIds = $deoWorkplaceId
                    ? Institution::where('deo_wp_id', $deoWorkplaceId)->pluck('workplace_id')
                    : collect();

                $baseQuery->whereHas('currentAppointment', function ($q) use ($institutionWorkplaceIds) {
                    $q->whereIn('workplace_id', $institutionWorkplaceIds);
                });
            }

            $query = clone $baseQuery;

            // NIC is encrypted at rest; do partial matching against decrypted model values.
            if ($nic !== '') {
                $matchedPeopleIds = (clone $baseQuery)
                    ->select(['people_id', 'nic'])
                    ->get()
                    ->filter(function (People $person) use ($nic) {
                        return str_contains((string) $person->nic, $nic);
                    })
                    ->pluck('people_id')
                    ->values();

                $query->whereIn('people_id', $matchedPeopleIds);
            }

            $query->with([
                'teacher.teacherCategory',
                'teacher.teacherType',
                'appointment',
                'currentAppointment.workplace.institution',
            ]);

            $teachers = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data'   => $teachers,
            ], 200);
        } catch (\Throwable $e) {

            Log::error('Teacher List Fetch Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch teacher list',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $minDob = Carbon::today()->subYears(35)->toDateString();
            $maxDob = Carbon::today()->subYears(18)->toDateString();

            // ==============================
            // BASIC VALIDATION
            // ==============================
            $validated = $request->validate([
                // PERSONAL
                'nic' => 'required|string',
                'is_new_registration' => 'required|boolean',

                'titleId' => 'required|string',
                'fullName' => 'required|string',
                'dateOfBirth' => ['required', 'date'],
                'genderId' => 'required|string',
                'religionId' => 'required|string',
                'ethnicityId' => 'required|string',
                'civilStatusId' => 'required|string',
                'bloodGroupId' => 'required|string',

                // ACADEMIC QUALIFICATIONS (minimum: certificate level)
                // 'educationQualifications' => 'required|array|min:1',
                // 'educationQualifications.*.qualificationId' => 'required|string|exists:education_qualifications,qualifications_id',
                // 'educationQualifications.*.effectiveDate' => 'required|date|before_or_equal:today',
                // 'educationQualifications.*.gradeId' => 'nullable|string|exists:educational_qualification_grades,grade_id',
                // 'educationQualifications.*.institution' => 'required|string|max:255',
                // 'educationQualifications.*.description' => 'nullable|string|max:255',

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
                'firstAppointmentType' => 'required|string',
                'firstAppointmentSubject' => 'required|string',
                'firstAppointmentMedium' => 'required|string',
                'firstAppointmentTeachingSubject' => 'required|string',

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

        

            DB::beginTransaction();

            // ==============================
            // NORMALIZE DATA
            // ==============================

            // Convert health condition to boolean properly
            $healthCondition = filter_var($validated['healthCondition'], FILTER_VALIDATE_BOOLEAN);

            // Generate initials
            $initials = People::generateInitials($validated['fullName']);

            $nic = NicHelper::normalize($validated['nic']);

            // ==============================
            // PEOPLE
            // ==============================
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
                    'ds_office_id' => $validated['dsOfficeId'],
                    'email' => strtolower($validated['email']),
                    'phone' => $validated['contact'],
                    'address_line1' => $validated['addressLine1'],
                    'address_line2' => $validated['addressLine2'],
                    'address_line3' => $validated['addressLine3'],
                    'postal_code' => $validated['postalCode'],
                    'profile_picture' => 'default.png',
                ]
            );

            // ==============================
            // GUARD: CHECK EXISTING APPOINTMENT
            // ==============================

            // Prevent duplicate teacher registration if active appointment exists
            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();

                activity('teacher_registration')
                    ->withProperties([
                        'nic_hash'    => NicHelper::hash($nic),
                        'people_id'   => $people->people_id,
                        'reason'      => 'Duplicate appointment guard: person already has an active appointment.',
                        'ip_address'  => $request->ip(),
                    ])
                    ->log('Teacher registration rejected: duplicate active appointment');

                throw new \Exception('This person already has an active appointment. Cannot register as a new teacher.');
            }
            
            // ==============================
            // FIRST APPOINTMENT
            // ==============================

            // Calculate retirement date (55 years from birth)
            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(55);

            // Generate appointment ID
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

            // ==============================
            // TEACHER
            // ==============================
            Teacher::create([
                'appointment_id' => $appointmentId,
                'employee_id' => $people->people_id,
                'teacher_category' => $validated['firstAppointmentCategory'],
                'teacher_type' => $validated['firstAppointmentType'],
                'appointment_medium' => $validated['firstAppointmentMedium'],
                'appointment_subject' => $validated['firstAppointmentSubject'],
                'main_subject' => $validated['firstAppointmentTeachingSubject'],
                'current_teaching_subject' => $validated['currentAppointmentSubject'],
            ]);

            // ==============================
            // CURRENT APPOINTMENT
            // ==============================
            EmployerCurrentAppointment::create([
                'appointment_id' => $appointmentId,
                'employee_id' => $people->people_id,
                'appoint_date' => $validated['currentAppointmentDate'],
                'service_id' => $validated['currentAppointmentService'],
                'rank_id' => $validated['currentAppointmentRank'],
                'office_level_id' => 'OLID006',
                'position_id' => $validated['currentAppointmentPosition'],
                'workplace_id' => $validated['currentAppointmentInstitution'],
            ]);

            // ==============================
            // SYSTEM USER
            // ==============================
            $user = User::create([
                'nic' => $nic,
                'nic_hash' => NicHelper::hash($nic),
                'people_id' => $people->people_id,
                'name' => $people->name_with_initials,
                'email' => strtolower($validated['email']),
                'contact' => $validated['contact'],
                'password' => Hash::make('password@123'),
            ]);

            $user->assignRole('teacher');

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Teacher created successfully',
                'people_id' => $people->people_id,
                'default_password' => 'password@123',
            ], 201);
        }
        // ==============================
        // VALIDATION ERROR
        // ==============================
        catch (ValidationException $e) {
            activity('teacher_registration')
                ->withProperties([
                    'errors'     => $e->errors(),
                    'ip_address' => $request->ip(),
                ])
                ->log('Teacher registration validation failed');

            return response()->json([
                'status' => 'validation_error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
        // ==============================
        // SERVER ERROR
        // ==============================
        catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Teacher Store Error', ['error' => $e]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error' . $e->getMessage(),
            ], 500);
        }
    }



    public function getTeacher($people_id)
    {



        $teacher = People::with([

            'title',
            'gender',
            'religion',
            'ethnicity',
            'civilStatus',
            'bloodGroup',
            'district',
            'gnDivision',

            // FIXED NAMES
            'myAppointments',                  // all appointments
            'appointment',                     // active first appointment
            'currentAppointment',              // current active appointment
            'appointmentHistory',              // full appointment history

            // Appointment → workplace
            'currentAppointment.workplace',
            'currentAppointment.workplace.ministry',
            'currentAppointment.workplace.provincial',
            'currentAppointment.workplace.zonal',
            'currentAppointment.workplace.divisional',
            'currentAppointment.workplace.institution',

            // Teacher relationships (if exist)
            'teacher',
            'teacher.appointmentSubject',
            'teacher.mainSubject',
            'teacher.secondarySubject',
            'teacher.currentTeachingSubject',

        ])
            ->where('people_id', $people_id)
            ->first();

//        if (!$teacher) {
//            return response()->json([
//                'status' => 'error',
//                'message' => 'Teacher not found',
//            ], 404);
//        }
//
//        if($jwt_people_id != $people_id){
//            return response()->json([
//                'status' => 'error',
//                'message' => 'people id mismatch',
//            ], 401);
//        }

//        if($jwt_role != $role){
//            return response()->json([
//                'status' => 'error',
//                'message' => 'role mismatch',
//            ], 401);
//        }

        return response()->json([
            'status' => 'success',
            'data' => $teacher,
        ], 200);
    }

    public function getTeacherWithNIC(string $nic)
    {
        try {
            // Normalize NIC
            $normalizedNic = NicHelper::normalize($nic);

            // Validate NIC
            if (! NicHelper::checkNicValid($normalizedNic)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Invalid NIC number',
                ], 422);
            }

            // Hash NIC
            $nicHash = NicHelper::hash($normalizedNic);

            // Fetch person regardless of role
            $people = People::query()
                ->with([
                    'title',
                    'gender',
                    'religion',
                    'ethnicity',
                    'civilStatus',
                    'bloodGroup',
                    'district',
                    'gnDivision.divisionalSecretariatOffice',
                    'currentAppointment.workplace.institution',
                    'appointment',
                ])
                ->where('nic_hash', $nicHash)
                ->first();

            // Not found
            if (! $people) {
                return response()->json([
                    'status'  => 'success',
                    'message' => 'NIC not available',
                    'active_appointment' => false,
                ], 200);
            }

            // Check active appointment
            $hasActiveAppointment = $people->appointment ? true : false;

            return response()->json([
                'status' => 'success',
                'message' => 'NIC available',
                'data'   => $people,
                'active_appointment' => $hasActiveAppointment,
            ], 200);
        } catch (\Throwable $e) {

            Log::error('Get Teacher By NIC Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch teacher data',
            ], 500);
        }
    }

    public function getPersonalFromData(Request $request)
    {
        $districtId = $request->query('district');
        $dsOfficeId = $request->query('ds_office');

        return response()->json([
            'status' => 'success',

            'titles' => Title::active()->get(),
            'genders' => GenderList::active()->get(),
            'religions' => Religion::active()->get(),
            'ethnicities' => Ethnicity::active()->get(),
            'civilStatuses' => CivilStatus::active()->get(),
            'bloodGroups' => BloodGroup::all(),

            'districts' => DistrictsList::active()->get(),

            'divisionalSecretariats' => $districtId
                ? DivisionalSecretariatOffice::where('district_id', $districtId)
                ->active()
                ->get()
                : [],

            'gnDivisions' => $dsOfficeId
                ? GnDivision::where('dso_id', $dsOfficeId)
                ->active()
                ->get()
                : [],
        ]);
    }

    public function getAppoinmentFromData(Request $request)
    {
        $service = $request->query('service');
        $institutionCategory = $request->query('ins_cat');
        $zone = $request->query('zone');

        return response()->json([
            'status' => 'success',

            'teacherCategorys' => TeacherCategory::active()->get(),
            'teacherTypes' => TeacherType::active()->get(),
            'apointmentSubjects' => ApointedSubject::active()->orderBy('name_en')->get(),
            'appointmentMedium' => MediumOfInstruction::active()->get(),
            'service' => Service::active()->get(),
            'serviceRanks' => $service ? ServiceRank::where('service_id', $service)->active()->get() : [],
            'positions' => $service ? Position::where('service_id', $service)->active()->get() : [],
            'mainTeachingSubjects' => SubjectList::active()->orderBy('name_en')->get(),
            'aapointedSubjects' => ApointedSubject::active()->orderBy('name_en')->get(),
            'institutionCategory' => InstitutionCategory::active()->get(),
            'zonalEducationOffices' => ZonalEducationOffice::active()->get(),
            'institutions' => $zone && $institutionCategory ? Institution::where('zeo_wp_id', $zone)->where('institution_category_id', $institutionCategory)->get() : [],
        ]);
    }

    public function update(Request $request, string $people_id)
    {
        try {
            $people = People::whereHas('teacher')->find($people_id);

            if (! $people) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Teacher not found',
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
                'healthCondition'            => 'sometimes|boolean',
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

                // TEACHER
                'teacherCategory'        => 'sometimes|string',
                'teacherType'            => 'sometimes|string',
                'appointmentMedium'      => 'sometimes|string',
                'appointmentSubject'     => 'sometimes|string',
                'mainSubject'            => 'sometimes|string',
                'secondarySubject'       => 'sometimes|string',
                'currentTeachingSubject' => 'sometimes|string',

                // CURRENT APPOINTMENT
                'serviceId'     => 'sometimes|string',
                'rankId'        => 'sometimes|string',
                'positionId'    => 'sometimes|string',
                'institutionId' => 'sometimes|string',
            ]);

            DB::beginTransaction();

            // ---- UPDATE PEOPLE ----
            $peopleData = array_filter([
                'title_id'           => $validated['titleId'] ?? null,
                'full_name'          => isset($validated['fullName']) ? ucwords(strtolower($validated['fullName'])) : null,
                'name_with_initials' => isset($validated['fullName']) ? People::generateInitials($validated['fullName']) : null,
                'gender_id'          => $validated['genderId'] ?? null,
                'date_of_birth'      => $validated['dateOfBirth'] ?? null,
                'religion_id'        => $validated['religionId'] ?? null,
                'ethnicity_id'       => $validated['ethnicityId'] ?? null,
                'civil_status_id'    => $validated['civilStatusId'] ?? null,
                'blood_group_id'     => $validated['bloodGroupId'] ?? null,
                'health_condition'   => $validated['healthCondition'] ?? null,
                'health_problem'     => $validated['healthConditionDescription'] ?? null,
                'district_id'        => $validated['districtId'] ?? null,
                'gn_division_id'     => $validated['gnDivisionId'] ?? null,
                'ds_office_id'       => $validated['dsOfficeId'] ?? null,
                'email'              => isset($validated['email']) ? strtolower($validated['email']) : null,
                'phone'              => $validated['contact'] ?? null,
                'address_line1'      => $validated['addressLine1'] ?? null,
                'address_line2'      => $validated['addressLine2'] ?? null,
                'address_line3'      => $validated['addressLine3'] ?? null,
                'postal_code'        => $validated['postalCode'] ?? null,
            ], fn ($v) => ! is_null($v));

            if (! empty($peopleData)) {
                $people->update($peopleData);
            }

            // ---- UPDATE TEACHER ----
            $teacherData = array_filter([
                'teacher_category'         => $validated['teacherCategory'] ?? null,
                'teacher_type'             => $validated['teacherType'] ?? null,
                'appointment_medium'       => $validated['appointmentMedium'] ?? null,
                'appointment_subject'      => $validated['appointmentSubject'] ?? null,
                'main_subject'             => $validated['mainSubject'] ?? null,
                'secondary_subject'        => $validated['secondarySubject'] ?? null,
                'current_teaching_subject' => $validated['currentTeachingSubject'] ?? null,
            ], fn ($v) => ! is_null($v));

            if (! empty($teacherData)) {
                Teacher::where('employee_id', $people->people_id)->update($teacherData);
            }

            // ---- UPDATE CURRENT APPOINTMENT ----
            $appointmentData = array_filter([
                'service_id'   => $validated['serviceId'] ?? null,
                'rank_id'      => $validated['rankId'] ?? null,
                'position_id'  => $validated['positionId'] ?? null,
                'workplace_id' => $validated['institutionId'] ?? null,
            ], fn ($v) => ! is_null($v));

            if (! empty($appointmentData)) {
                EmployerCurrentAppointment::where('employee_id', $people->people_id)->update($appointmentData);
            }

            // ---- UPDATE USER ----
            $userUpdate = array_filter([
                'name'    => isset($validated['fullName']) ? People::generateInitials($validated['fullName']) : null,
                'email'   => isset($validated['email']) ? strtolower($validated['email']) : null,
                'contact' => $validated['contact'] ?? null,
            ], fn ($v) => ! is_null($v));

            if (! empty($userUpdate)) {
                User::where('people_id', $people->people_id)->update($userUpdate);
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Teacher updated successfully',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Teacher Update Error', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Internal server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function verify(Request $request, string $people_id)
    {
        try {
            $roles        = $request->attributes->get('jwt_roles', []);
            $allowedRoles = ['development officer', 'super admin'];

            if (empty(array_intersect($roles, $allowedRoles))) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            $currentAppointment = EmployerCurrentAppointment::where('employee_id', $people_id)->first();

            if (! $currentAppointment) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'No active appointment found for this teacher',
                ], 404);
            }

            $appointment = $currentAppointment->appointment;

            if (! $appointment) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Appointment record not found',
                ], 404);
            }

            if ($appointment->is_verified) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Appointment is already verified',
                ], 409);
            }

            // ── Zone check (DEO officers only; super admin can verify anyone) ──
            if (! in_array('super admin', $roles)) {
                $deoWorkplaceId = EmployerCurrentAppointment::where('employee_id', $request->attributes->get('jwt_people_id'))
                    ->value('workplace_id');

                if (! $deoWorkplaceId) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'DEO officer has no active appointment on record',
                    ], 403);
                }

                $institutionDeoWpId = Institution::where('workplace_id', $currentAppointment->workplace_id)
                    ->value('deo_wp_id');

                if ($institutionDeoWpId !== $deoWorkplaceId) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'You can only verify teachers within your divisional zone',
                    ], 403);
                }
            }
            // ─────────────────────────────────────────────────────────────────

            $appointment->is_verified = true;
            $appointment->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'Teacher appointment verified successfully',
                'data'    => [
                    'appointment_id' => $appointment->appointment_id,
                    'is_verified'    => $appointment->is_verified,
                    'verified_by'    => $appointment->verified_by,
                    'verified_date'  => $appointment->verified_date,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Teacher Verify Error', [
                'people_id' => $people_id,
                'message'   => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to verify teacher appointment',
            ], 500);
        }
    }

    public function checkContact(Request $request)
    {
        $request->validate([
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        $email = $request->input('email');
        $phone = $request->input('phone');

        $emailExists = false;
        $phoneExists = false;

        if ($email) {
            $emailExists = People::where('email', $email)->exists()
                || User::where('email', $email)->exists();
        }

        if ($phone) {
            $phoneExists = People::where('phone', $phone)->exists()
                || User::where('contact', $phone)->exists();
        }

        return response()->json([
            'status' => 'success',
            'email'  => ['exists' => $emailExists],
            'phone'  => ['exists' => $phoneExists],
        ]);
    }
}
