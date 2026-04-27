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

    private function hasAnyRole(array $roles, array $allowedRoles): bool
    {
        $allowed = collect($allowedRoles)
            ->map(fn (string $role) => strtolower(trim($role)))
            ->all();

        return ! empty(array_intersect($roles, $allowed));
    }

    private function resolveUserZonalWorkplaceId(Request $request): ?string
    {
        $appointment = $request->user()?->currentAppointment;

        if (! $appointment?->workplace_id) {
            return null;
        }

        $workplaceId = $appointment->workplace_id;

        if (ZonalEducationOffice::where('workplace_id', $workplaceId)->exists()) {
            return $workplaceId;
        }

        $deoZonalWorkplaceId = DivisionalEducationOffice::where('workplace_id', $workplaceId)
            ->value('zeo_wp_id');

        if ($deoZonalWorkplaceId) {
            return $deoZonalWorkplaceId;
        }

        return Institution::where('workplace_id', $workplaceId)
            ->value('zeo_wp_id');
    }

    private function applyTeacherZonalScope($query, string $zonalWorkplaceId)
    {
        return $query->whereHas('currentAppointment.workplace.institution', function ($q) use ($zonalWorkplaceId) {
            $q->where('zeo_wp_id', $zonalWorkplaceId);
        });
    }

    private function appendRejectCommentSummary(array $payload, $rejectComments): array
    {
        $formattedComments = collect($rejectComments ?? [])
            ->unique(function ($comment) {
                return $comment->id
                    ?? implode('|', [
                        $comment->employer_appointment_id ?? '',
                        $comment->people_id ?? '',
                        $comment->reject_comment ?? '',
                        optional($comment->reject_date)->format('Y-m-d H:i:s') ?? (string) ($comment->reject_date ?? ''),
                    ]);
            })
            ->map(function ($comment) {
            $commentData = method_exists($comment, 'toArray')
                ? $comment->toArray()
                : (array) $comment;

            $displayName = $comment->rejectedBy?->name_with_initials
                ?? $comment->rejectedBy?->full_name
                ?? User::where('people_id', $comment->people_id)->value('name')
                ?? $comment->rejectedBy?->email;

            $commentData['commented_by_name'] = $displayName;
            $commentData['rejected_by_display_name'] = $displayName;

            return $commentData;
        })->values()->all();
        $latestComment = $formattedComments[0] ?? null;

        $payload['reject_comments'] = $formattedComments;
        $payload['all_comments'] = $payload['reject_comments'];
        $payload['comments'] = $payload['reject_comments'];
        $payload['current_reject_comment'] = $latestComment['reject_comment'] ?? null;
        $payload['current_reject_comment_date'] = $latestComment['reject_date'] ?? null;
        $payload['current_reject_comment_by'] = $formattedComments[0]['commented_by_name'] ?? null;

        // Backward compatibility for existing frontend consumers.
        $payload['current_reject_reason'] = $payload['current_reject_comment'];
        $payload['current_reject_reason_date'] = $payload['current_reject_comment_date'];

        return $payload;
    }

    private function resolveProfileStatus(?int $isVerified): string
    {
        return match ($isVerified) {
            1 => 'verified',
            2 => 'rejected',
            3 => 'revised',
            default => 'pending',
        };
    }

    private function buildActionVisibility(array $roles, string $profileStatus): array
    {
        $isDoHead = $this->hasAnyRole($roles, ['development officer head']);
        $isDo = $this->hasAnyRole($roles, ['development officer']);

        $actions = [
            'show_update_button' => true,
            'show_verify_button' => true,
            'show_reject_button' => true,
        ];

        if ($profileStatus === 'revised') {
            if ($isDoHead) {
                $actions['show_update_button'] = false;
                $actions['show_verify_button'] = true;
                $actions['show_reject_button'] = true;
            } elseif ($isDo) {
                $actions['show_update_button'] = false;
                $actions['show_verify_button'] = false;
            }
        }

        return $actions;
    }

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
            $roles   = $this->resolvedRoles($request);

            $baseQuery = People::query()
                ->whereHas('teacher')
                ->whereHas('appointment', function ($appointmentQuery) {
                    $appointmentQuery->where('service_id', '!=', 'SER004');
                });
            $query = clone $baseQuery;

            // Scope registration forms to the authenticated officer's zonal office.
            if ($this->hasAnyRole($roles, ['development officer', 'development officer head'])) {
                $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);

                if (! $zonalWorkplaceId) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Authenticated user has no zonal workplace mapped',
                    ], 403);
                }

                $this->applyTeacherZonalScope($query, $zonalWorkplaceId);
            }

            

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
            // ==============================
            // BASIC VALIDATION
            // ==============================
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



    public function getTeacher(Request $request, $people_id)
    {
        $roles = $this->resolvedRoles($request);
        $zonalWorkplaceId = null;

        if ($this->hasAnyRole($roles, ['development officer', 'development officer head'])) {
            $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);

            if (! $zonalWorkplaceId) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Authenticated user has no zonal workplace mapped',
                ], 403);
            }
        }

        $teacher = People::with([

            'title',
            'gender',
            'religion',
            'ethnicity',
            'civilStatus',
            'bloodGroup',
            'district',
            'gnDivision',
            'gnDivision.divisionalSecretariatOffice',

            // FIXED NAMES
            'myAppointments',                  // all appointments
            'appointment',                     // active first appointment
            'currentAppointment',              // current active appointment
            'currentAppointment.appointment.rejectComments.rejectedBy',
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
            ->whereHas('appointment')
            ->where('people_id', $people_id)
            ->when($zonalWorkplaceId, function ($query) use ($zonalWorkplaceId) {
                $this->applyTeacherZonalScope($query, $zonalWorkplaceId);
            })
            ->first();

        if (! $teacher) {
            return response()->json([
                'status' => 'error',
                'message' => 'Teacher not found for the permitted zonal scope',
            ], 404);
        }

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

        $teacherData = $teacher?->toArray() ?? [];
        $currentRejectComments = $teacher?->currentAppointment?->appointment?->rejectComments;
        $teacherData = $this->appendRejectCommentSummary($teacherData, $currentRejectComments);
        $profileStatus = $this->resolveProfileStatus((int) ($teacher?->currentAppointment?->appointment?->is_verified ?? 0));
        $teacherData['profile_status'] = $profileStatus;
        $teacherData['ui_actions'] = $this->buildActionVisibility($roles, $profileStatus);
        $dsOfficeId = $teacher?->ds_office_id;

        return response()->json([
            'status' => 'success',
            'data' => $teacherData,
            'divisionalSecretariats' => $teacher?->district_id
                ? DivisionalSecretariatOffice::where('district_id', $teacher->district_id)
                ->active()
                ->get()
                : [],
            'gnDivisions' => $dsOfficeId
                ? GnDivision::where('dso_id', $dsOfficeId)
                ->active()
                ->get()
                : [],
        ], 200);
    }

    public function getTeacherWithNIC(Request $request, string $nic)
    {
        try {
            $roles = $this->resolvedRoles($request);
            $zonalWorkplaceId = null;

            if ($this->hasAnyRole($roles, ['development officer', 'development officer head'])) {
                $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);

                if (! $zonalWorkplaceId) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Authenticated user has no zonal workplace mapped',
                    ], 403);
                }
            }

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
                    'currentAppointment.appointment.rejectComments.rejectedBy',
                ])
                ->when($zonalWorkplaceId, function ($query) use ($zonalWorkplaceId) {
                    $this->applyTeacherZonalScope($query, $zonalWorkplaceId);
                })
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

            $peopleData = $people->toArray();
            $currentRejectComments = $people->currentAppointment?->appointment?->rejectComments;
            $peopleData = $this->appendRejectCommentSummary($peopleData, $currentRejectComments);

            return response()->json([
                'status' => 'success',
                'message' => 'NIC available',
                'data'   => $peopleData,
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
