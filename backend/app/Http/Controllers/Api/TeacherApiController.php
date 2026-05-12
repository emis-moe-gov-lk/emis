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
use App\Models\PeopleEducationQualification;
use App\Models\EducationQualification;
use App\Models\EducationalQualificationGrade;

use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\In;
use App\Http\Controllers\Controller;
use App\Models\DivisionalEducationOffice;
use App\Models\ZonalEducationOffice;
use App\Models\OfficeLevel;
use App\Models\MinistryOfEducationOffice;
use App\Models\ProvincialMinistryOfEducationOffice;
use App\Models\ProvincialEducationOffice;
use Illuminate\Support\Facades\Hash;
use App\Models\EmployerCurrentAppointment;
use App\Models\DivisionalSecretariatOffice;
use App\Services\TeacherAccountProvisioningService;
use App\Traits\ResolvesZonalScope;

use Illuminate\Validation\ValidationException;

class TeacherApiController extends Controller
{
    use ResolvesZonalScope;
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
        $isDoHead = $this->hasAnyRole($roles, ['development officer head', 'zonal deo head']);
        $isDo = $this->hasAnyRole($roles, ['development officer', 'zonal deo']);

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
            $search  = trim($request->get('search', $request->get('nic', '')));
            $roles   = $this->resolvedRoles($request);

            $baseQuery = People::query()
                ->whereHas('teacher')
                ->whereHas('appointment', function ($appointmentQuery) {
                    $appointmentQuery->where('service_id', '!=', 'SER004');
                });
            $query = clone $baseQuery;

            // Scope registration forms to the authenticated officer's zonal office.
            if ($this->hasAnyRole($roles, ['development officer', 'development officer head', 'zonal deo', 'zonal deo head', 'zonal director'])) {
                $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);

                if (! $zonalWorkplaceId) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Authenticated user has no zonal workplace mapped',
                    ], 403);
                }

                $this->applyTeacherZonalScope($query, $zonalWorkplaceId);
            }



            // Both NIC and name fields are encrypted at rest; do partial matching against decrypted model values.
            // Detect search type: numeric first char → NIC search, alphabetic → name search.
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
            $roles = $this->resolvedRoles($request);
            if (! $this->hasAnyRole($roles, ['super admin', 'zonal deo'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only Super Admin and Zonal DEO users can create teacher profiles.',
                ], 403);
            }

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
            DB::commit();

            // Resolve human-readable current appointment position name (if available)
            $positionName = null;
            try {
                $positionName = Position::where('position_id', $validated['currentAppointmentPosition'])->value('position_name');
            } catch (\Throwable $ex) {
                // swallow - not critical for response
                Log::warning('Failed to resolve position name for response', ['error' => $ex->getMessage()]);
            }

            $responseData = [
                'name' => $people->full_name,
                'fullName' => $people->full_name,
                'nic' => $people->nic,
                'email' => $people->email,
                'contact' => $people->phone,
                'currentAppointmentPositionName' => $positionName,
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Teacher created successfully',
                'data' => $responseData,
                'people_id' => $people->people_id,
                'login_account_status' => 'pending_confirmation',
                'account_will_be_created_on_confirmation' => true,
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

        if ($this->hasAnyRole($roles, ['development officer', 'development officer head', 'zonal deo', 'zonal deo head'])) {
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
            'dsOffice',
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

            // First appointment resolved fields
            'appointment.service',
            'appointment.rank',
            'appointment.position',
            'appointment.workplace',
            'appointment.workplace.institution',

            // Current appointment resolved fields
            'currentAppointment.service',
            'currentAppointment.rank',
            'currentAppointment.position',

            // Teacher relationships (if exist)
            'teacher',
            'teacher.teacherCategory',
            'teacher.teacherType',
            'teacher.medium',
            'teacher.appointmentSubject',
            'teacher.mainSubject',
            'teacher.secondarySubject',
            'teacher.currentTeachingSubject',

            // Education qualifications with relationships - load all for debugging
            'educationQualifications',
            'educationQualifications.qualification',
            'educationQualifications.qualificationGrade',

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

        // DEBUG: Log what's being loaded
        $educationQuals = $teacher?->educationQualifications;
        Log::info('Teacher Data Debug', [
            'people_id' => $people_id,
            'education_qualifications_count' => $educationQuals?->count() ?? 0,
            'education_qualifications' => $educationQuals?->map(function($q) {
                return [
                    'id' => $q->id,
                    'qualifications_id' => $q->qualifications_id,
                    'active_status' => $q->active_status,
                    'institution' => $q->institution,
                ];
            })->toArray() ?? [],
        ]);

//        if (!$teacher) {
//            return response()->json([
//                'status' => 'error',
//                'message' => 'Teacher not found',
//            ], 404);
//        }
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

        // Ensure educationQualifications are explicitly included
        if (!isset($teacherData['educationQualifications'])) {
            $teacherData['educationQualifications'] = $teacher?->educationQualifications?->toArray() ?? [];
        }

        $currentRejectComments = $teacher?->currentAppointment?->appointment?->rejectComments;
        $teacherData = $this->appendRejectCommentSummary($teacherData, $currentRejectComments);
        $profileStatus = $this->resolveProfileStatus((int) ($teacher?->currentAppointment?->appointment?->is_verified ?? 0));
        $teacherData['profile_status'] = $profileStatus;
        $teacherData['ui_actions'] = $this->buildActionVisibility($roles, $profileStatus);
        $dsOfficeDsoId = $teacher?->dsOffice?->dso_id ?? $this->resolveDsOfficeDsoId((string) $teacher?->ds_office_id);

        // DEBUG: Log the final response
        Log::info('Final API Response - Education Qualifications', [
            'people_id' => $people_id,
            'education_qualifications_in_response' => isset($teacherData['educationQualifications']),
            'education_qualifications_count' => count($teacherData['educationQualifications'] ?? []),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $teacherData,
            'divisionalSecretariats' => $teacher?->district_id
                ? DivisionalSecretariatOffice::where('district_id', $teacher->district_id)
                ->active()
                ->get()
                : [],
            'gnDivisions' => $dsOfficeDsoId
                ? GnDivision::where('dso_id', $dsOfficeDsoId)
                ->active()
                ->get()
                : [],
        ], 200);
    }

    public function updateProfile(Request $request, string $people_id, TeacherAccountProvisioningService $teacherAccountProvisioningService)
    {
        $roles = $this->resolvedRoles($request);

        if (! $this->hasAnyRole($roles, ['development officer', 'development officer head', 'zonal deo', 'zonal deo head', 'zonal director', 'super admin'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $teacher = People::query()
            ->with(['currentAppointment.appointment', 'teacher', 'user'])
            ->where('people_id', $people_id)
            ->first();

        if (! $teacher?->teacher) {
            return response()->json([
                'status' => 'error',
                'message' => 'Teacher not found',
            ], 404);
        }

        $currentAppointment = $teacher->currentAppointment;

        if (! $this->isSuperAdmin($roles)) {
            $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);

            if (! $zonalWorkplaceId) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Authenticated user has no zonal workplace mapped',
                ], 403);
            }

            $teacherZonalWorkplaceId = Institution::where('workplace_id', $currentAppointment?->workplace_id)
                ->value('zeo_wp_id');

            if ($teacherZonalWorkplaceId !== $zonalWorkplaceId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You can only update teachers within your relevant zonal area',
                ], 403);
            }
        }

        $section = (string) $request->input('section');

      if (! in_array($section, ['personal', 'health', 'contact', 'temporary', 'appointment'], true)) {
    return response()->json([
        'status' => 'error',
        'message' => 'Invalid update section',
    ], 422);
}

        $rules = match ($section) {
            'personal' => [
                'titleId' => 'required|string',
                'fullName' => 'required|string|max:255',
                'genderId' => 'required|string',
                'dateOfBirth' => 'required|date',
                'ethnicityId' => 'required|string',
                'religionId' => 'required|string',
                'civilStatusId' => 'required|string',
            ],
            'health' => [
                'bloodGroupId' => 'required|string',
                'healthCondition' => 'required|in:0,1',
                'knownProblems' => 'nullable|string|max:500',
            ],
            'contact' => [
                'email' => 'required|email:rfc,dns',
                'phone' => 'required|digits:10',
                'districtId' => 'required|string',
                'dsOfficeId' => 'required',
                'gnDivisionId' => 'required|string',
                'addressLine1' => 'required|string|max:255',
                'addressLine2' => 'required|string|max:255',
                'addressLine3' => 'nullable|string|max:255',
                'postalCode' => 'required|string|max:20',
                'latitude' => 'nullable|string|max:100',
                'longitude' => 'nullable|string|max:100',
            ],
            'temporary' => [
                'tAddressLine1' => 'nullable|string|max:255',
                'tAddressLine2' => 'nullable|string|max:255',
                'tAddressLine3' => 'nullable|string|max:255',
                'tPostalCode' => 'nullable|string|max:20',
            ],
            'appointment' => [
        'service_id' => 'required|string',
        'rank_id' => 'required|string',
        'position_id' => 'required|string',
        'appoint_date' => 'required|date',
        'appointment_letter_no' => 'nullable|string',
    ],
        };

        $validated = $request->validate($rules);

        if ($section === 'contact') {
            $email = strtolower(trim((string) $validated['email']));
            $phone = (string) $validated['phone'];

            $emailConflict = People::query()
                ->where('email', $email)
                ->where('people_id', '!=', $teacher->people_id)
                ->exists()
                || User::query()
                    ->where('email', $email)
                    ->where('people_id', '!=', $teacher->people_id)
                    ->exists();

            $phoneConflict = People::query()
                ->where('phone', $phone)
                ->where('people_id', '!=', $teacher->people_id)
                ->exists()
                || User::query()
                    ->where('contact', $phone)
                    ->where('people_id', '!=', $teacher->people_id)
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

        DB::transaction(function () use ($section, $validated, $teacher) {
            if ($section === 'personal') {
                $fullName = ucwords(strtolower($validated['fullName']));

                $teacher->update([
                    'title_id' => $validated['titleId'],
                    'full_name' => $fullName,
                    'name_with_initials' => People::generateInitials($fullName),
                    'gender_id' => $validated['genderId'],
                    'date_of_birth' => $validated['dateOfBirth'],
                    'ethnicity_id' => $validated['ethnicityId'],
                    'religion_id' => $validated['religionId'],
                    'civil_status_id' => $validated['civilStatusId'],
                ]);
            }

            if ($section === 'health') {
                $teacher->update([
                    'blood_group_id' => $validated['bloodGroupId'],
                    'health_condition' => (int) $validated['healthCondition'],
                    'health_problem' => $validated['knownProblems'] ?? null,
                ]);
            }

            if ($section === 'contact') {
                $teacher->update([
                    'email' => strtolower(trim((string) $validated['email'])),
                    'phone' => $validated['phone'],
                    'district_id' => $validated['districtId'],
                    'ds_office_id' => $this->resolveDsOfficePrimaryKey((string) $validated['dsOfficeId']),
                    'gn_division_id' => $validated['gnDivisionId'],
                    'address_line1' => $validated['addressLine1'],
                    'address_line2' => $validated['addressLine2'],
                    'address_line3' => $validated['addressLine3'] ?? null,
                    'postal_code' => $validated['postalCode'],
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                ]);
            }

            if ($section === 'temporary') {
                $teacher->update([
                    't_address_line1' => $validated['tAddressLine1'] ?? null,
                    't_address_line2' => $validated['tAddressLine2'] ?? null,
                    't_address_line3' => $validated['tAddressLine3'] ?? null,
                    't_postal_code' => $validated['tPostalCode'] ?? null,
                ]);
            }

    if ($section === 'appointment') {
        // Update current appointment (EmployerCurrentAppointment)
        $currentAppointment = EmployerCurrentAppointment::where('employee_id', $teacher->people_id)->first();

        if ($currentAppointment) {
            $currentAppointment->update([
                'service_id' => $validated['service_id'],
                'rank_id' => $validated['rank_id'],
                'position_id' => $validated['position_id'],
                'appoint_date' => $validated['appoint_date'],
            ]);
        }

        // Update appointment letter number in main appointment (EmployerAppointment)
        if (isset($validated['appointment_letter_no'])) {
            $appointment = EmployerAppointment::where('employee_id', $teacher->people_id)->first();
            if ($appointment) {
                $appointment->update([
                    'appointment_letter_no' => $validated['appointment_letter_no']
                ]);
            }
        }
    }
});


        $teacher->refresh();
        $accountSync = $teacherAccountProvisioningService->syncProfile($teacher);
        $profileStatus = $this->resolveProfileStatus((int) ($teacher->currentAppointment?->appointment?->is_verified ?? 0));

        return response()->json([
            'status' => 'success',
            'message' => 'Teacher profile updated successfully',
            'data' => [
                'profile_status' => $profileStatus,
                'account_sync' => $accountSync,
            ],
        ]);
    }

    public function getTeacherWithNIC(Request $request, string $nic)
    {
        try {
            $roles = $this->resolvedRoles($request);
            $zonalWorkplaceId = null;

            if ($this->hasAnyRole($roles, ['development officer', 'development officer head', 'zonal deo', 'zonal deo head'])) {
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
                    'dsOffice',
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
        $dsOfficeDsoId = $this->resolveDsOfficeDsoId($request->query('ds_office'));

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

            'gnDivisions' => $dsOfficeDsoId
                ? GnDivision::where('dso_id', $dsOfficeDsoId)
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
        $officeLevel = $request->query('office_level');

        $workplacesByLevel = match ($officeLevel) {
            'OLID001' => MinistryOfEducationOffice::active()->get(),
            'OLID002' => ProvincialMinistryOfEducationOffice::active()->get(),
            'OLID003' => ProvincialEducationOffice::active()->get(),
            'OLID004' => ZonalEducationOffice::active()->get(),
            'OLID005' => DivisionalEducationOffice::active()->get(),
            default   => [],
        };

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
            'recruitmentCategories' => RecruitmentCategory::active()->orderBy('category_id')->get(),
            'zonalPositions' => Position::where('service_id', 'SER005')
                ->where('position_name', 'like', '%Zonal%')
                ->active()
                ->get(),
            'officeLevels' => OfficeLevel::active()->orderBy('office_level_rank')->get(),
            'workplacesByLevel' => $workplacesByLevel,
        ]);
    }

    public function getCurrentAppointmentFormData(Request $request)
    {
        $service = $request->query('service');
        $institutionCategory = $request->query('ins_cat');
        $zone = $request->query('zone');

        $roles = $request->attributes->get('jwt_roles', []);
        $isSuperAdmin = in_array('super admin', $roles);

        if ($isSuperAdmin) {
            $zonalOffices = ZonalEducationOffice::active()->get();
        } else {
            $workplaceId = auth()->user()?->currentAppointment?->workplace_id;

            // Check if the user works directly at a ZEO (zonal deo)
            $zeo = ZonalEducationOffice::where('workplace_id', $workplaceId)->active()->first();

            if ($zeo) {
                $zonalOffices = collect([$zeo]);
            } else {
                // Development officer — find their parent ZEO via their divisional office
                $zeoWpId = DivisionalEducationOffice::where('workplace_id', $workplaceId)->value('zeo_wp_id');
                $zonalOffices = $zeoWpId
                    ? ZonalEducationOffice::where('workplace_id', $zeoWpId)->active()->get()
                    : collect();
            }
        }

        return response()->json([
            'status' => 'success',
            'service' => Service::active()->get(),
            'serviceRanks' => $service ? ServiceRank::where('service_id', $service)->active()->get() : [],
            'positions' => $service ? Position::where('service_id', $service)->active()->get() : [],
            'mainTeachingSubjects' => SubjectList::active()->orderBy('name_en')->get(),
            'institutionCategory' => InstitutionCategory::active()->get(),
            'zonalEducationOffices' => $zonalOffices,
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

    public function saveEducationQualification(Request $request, $people_id)
    {
        try {
            $validated = $request->validate([
                'id' => 'nullable|integer|exists:people_education_qualifications,id',
                'qualification' => 'required|string|exists:education_qualifications,qualifications_id',
                'institution_university' => 'required|string|max:255',
                'effective_date' => 'required|date',
                'grade_result' => 'required|string|exists:educational_qualification_grades,grade_id',
                'additional_details' => 'nullable|string|max:1000',
            ]);

            // Ensure people_id exists
            $person = People::where('people_id', $people_id)->first();
            if (!$person) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Teacher profile not found.',
                ], 404);
            }

            DB::beginTransaction();

            if (!empty($validated['id'])) {
                $qualification = PeopleEducationQualification::where('id', $validated['id'])
                    ->where('people_id', $people_id)
                    ->firstOrFail();

                $qualification->update([
                    'qualifications_id' => $validated['qualification'],
                    'institution' => $validated['institution_university'],
                    'effective_date' => $validated['effective_date'],
                    'grade' => $validated['grade_result'],
                    'description' => $validated['additional_details'],
                ]);
                $statusCode = 200;
                $message = 'Education qualification updated successfully.';
            } else {
                $qualification = PeopleEducationQualification::create([
                    'people_id' => $people_id,
                    'qualifications_id' => $validated['qualification'],
                    'institution' => $validated['institution_university'],
                    'effective_date' => $validated['effective_date'],
                    'grade' => $validated['grade_result'],
                    'description' => $validated['additional_details'],
                    'active_status' => 1,
                ]);

                Log::info('Education Qualification Saved', [
                    'qualification_id' => $qualification->id,
                    'people_id' => $people_id,
                    'qualifications_id' => $validated['qualification'],
                    'active_status' => $qualification->active_status,
                ]);

                $statusCode = 201;
                $message = 'Education qualification saved successfully.';
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => $message,
                'data' => $qualification,
            ], $statusCode);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'validation_error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Save Education Qualification Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getEducationQualifications()
    {
        try {
            $qualifications = EducationQualification::active()
                ->select('qualifications_id', 'qualification')
                ->orderBy('qualification', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $qualifications,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Get Education Qualifications Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch education qualifications.',
            ], 500);
        }
    }

    public function getEducationQualificationGrades()
    {
        try {
            $grades = EducationalQualificationGrade::where('active_status', 1)
                ->select('grade_id', 'grade')
                ->orderBy('grade', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $grades,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Get Education Qualification Grades Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch education qualification grades.',
            ], 500);
        }
    }
}
