<?php

namespace App\Http\Controllers\API;

use Carbon\Carbon;
use App\Models\User;
use App\Models\People;
use App\Models\Position;
use App\Helpers\NicHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Models\EmployerAppointment;
use App\Models\EmployerCurrentAppointment;
use App\Models\DivisionalSecretariatOffice;
use App\Services\Wso2IsProvisioningService;
use App\Traits\ResolvesZonalScope;

class SchoolDeoApiController extends Controller
{
    use ResolvesZonalScope;

    /**
     * Resolve DS Office by various identifiers.
     */
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

    /**
     * Resolve DS Office primary key.
     */
    private function resolveDsOfficePrimaryKey(?string $value): ?int
    {
        return $this->resolveDsOffice($value)?->id;
    }

    /**
     * Display a listing of School DEOs.
     */
    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $search  = trim((string) $request->get('search', ''));
            $roles   = $this->resolvedRoles($request);

            $schoolDeoPeopleIds = User::query()
                ->whereHas('roles', function ($query) {
                    $query->where('name', 'School DEO');
                })
                ->pluck('people_id');

            $baseQuery = People::query()
                ->whereIn('people_id', $schoolDeoPeopleIds);
            
            $query = clone $baseQuery;

            // Zonal scope filtering
            if (!$this->isSuperAdmin($roles)) {
                $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);
                if ($zonalWorkplaceId) {
                    $this->applyTeacherZonalScope($query, $zonalWorkplaceId);
                }
            }

            // Search logic (decrypted matching)
            if ($search !== '') {
                $isNicSearch = is_numeric(substr($search, 0, 1));
                if ($isNicSearch) {
                    $matchedPeopleIds = (clone $baseQuery)
                        ->select(['people_id', 'nic'])
                        ->get()
                        ->filter(fn($p) => str_contains((string)$p->nic, $search))
                        ->pluck('people_id');
                } else {
                    $searchLower = strtolower($search);
                    $matchedPeopleIds = (clone $baseQuery)
                        ->select(['people_id', 'full_name', 'name_with_initials'])
                        ->get()
                        ->filter(fn($p) => str_contains(strtolower((string)$p->full_name), $searchLower) || str_contains(strtolower((string)$p->name_with_initials), $searchLower))
                        ->pluck('people_id');
                }
                $query->whereIn('people_id', $matchedPeopleIds);
            }

            $query->with([
                'title',
                'gender',
                'appointment',
                'currentAppointment.service',
                'currentAppointment.rank',
                'currentAppointment.position',
                'currentAppointment.workplace.institution',
            ]);

            $officers = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data'   => $officers,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('School DEO List Fetch Error', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch school deo list',
            ], 500);
        }
    }

    /**
     * Store a newly created School DEO.
     */
    public function store(Request $request, Wso2IsProvisioningService $wso2Is)
    {
        try {
            $roles = $this->resolvedRoles($request);
            if (!$this->hasAnyRole($roles, ['super admin', 'zonal deo', 'zonal deo head'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only Super Admin and Zonal DEO users can create school deo profiles.',
                ], 403);
            }

            $validated = $request->validate([
                // PERSONAL
                'nic' => 'required|string',
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

                // FIRST APPOINTMENT (Optional for DEO now)
                'firstAppointmentDate' => 'nullable|date',
                'firstAppointmentLetter' => 'nullable|string',
                'firstAppointmentService' => 'nullable|string',
                'firstAppointmentRank' => 'nullable|string',
                'firstAppointmentInstitution' => 'nullable|string',
                'firstAppointmentPosition' => 'nullable|string',

                // CURRENT APPOINTMENT
                'currentAppointmentDate' => 'required|date',
                'currentAppointmentLetter' => 'required|string',
                'currentAppointmentService' => 'nullable|string', // Optional for DEO
                'currentAppointmentRank' => 'nullable|string',    // Optional for DEO
                'currentAppointmentInstitution' => 'required|string',
                'currentAppointmentPosition' => 'required|string',
            ]);

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

            // Duplicate appointment guard
            if (EmployerCurrentAppointment::where('employee_id', $people->people_id)->exists()) {
                DB::rollBack();
                return response()->json([
                    'status' => 'error',
                    'message' => 'This person already has an active appointment.',
                ], 409);
            }

            // Defaults for DEO
            $deoService = ($validated['currentAppointmentService'] ?? null) ?: 'SER007';
            $deoRank = ($validated['currentAppointmentRank'] ?? null) ?: 'RANK019';

            $firstApptDate = ($validated['firstAppointmentDate'] ?? null) ?: $validated['currentAppointmentDate'];
            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(55);
            $appointmentId = EmployerAppointment::generateAppointmentId($firstApptDate);

            // First Appointment
            EmployerAppointment::create([
                'appointment_id' => $appointmentId,
                'employee_id' => $people->people_id,
                'first_appointment_date' => $firstApptDate,
                'retirement_date' => $retirementDate->toDateString(),
                'service_id' => ($validated['firstAppointmentService'] ?? null) ?: $deoService,
                'rank_id' => ($validated['firstAppointmentRank'] ?? null) ?: $deoRank,
                'position_id' => ($validated['firstAppointmentPosition'] ?? null) ?: $validated['currentAppointmentPosition'],
                'office_level_id' => 'OLID006',
                'workplace_id' => ($validated['firstAppointmentInstitution'] ?? null) ?: $validated['currentAppointmentInstitution'],
                'appointment_letter_no' => ($validated['firstAppointmentLetter'] ?? null) ?: $validated['currentAppointmentLetter'],
                'appointment_letter' => 'none.pdf',
            ]);

            // Current Appointment
            EmployerCurrentAppointment::create([
                'appointment_id' => $appointmentId,
                'employee_id' => $people->people_id,
                'appoint_date' => $validated['currentAppointmentDate'],
                'appointment_letter_no' => $validated['currentAppointmentLetter'],
                'service_id' => $deoService,
                'rank_id' => $deoRank,
                'office_level_id' => 'OLID006',
                'position_id' => $validated['currentAppointmentPosition'],
                'workplace_id' => $validated['currentAppointmentInstitution'],
            ]);

            // Create User Record
            $user = User::create([
                'nic' => $nic,
                'nic_hash' => NicHelper::hash($nic),
                'people_id' => $people->people_id,
                'name' => $people->name_with_initials,
                'email' => strtolower($validated['email']),
                'contact' => $validated['contact'],
                'password' => Hash::make('Password@123'),
            ]);

            $user->assignRole('School DEO');

            DB::commit();

            // WSO2 Provisioning
            try {
                $wso2Is->provisionUser($user, 'Password@123', 'school deo');
            } catch (\Throwable $ex) {
                Log::warning('WSO2 Provisioning failed for School DEO', ['error' => $ex->getMessage()]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'School DEO created successfully',
                'data' => [
                    'name' => $people->full_name,
                    'nic' => $people->nic,
                    'email' => $people->email,
                    'contact' => $people->phone,
                ],
                'people_id' => $people->people_id,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'validation_error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('School DEO Store Error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, $people_id)
    {
        try {
            $roles = $this->resolvedRoles($request);
            
            $query = People::with([
                'title', 'gender', 'religion', 'ethnicity', 'civilStatus', 'bloodGroup',
                'district', 'dsOffice', 'gnDivision.divisionalSecretariatOffice',
                'appointment', 'currentAppointment.service', 'currentAppointment.rank',
                'currentAppointment.position', 'currentAppointment.workplace.institution'
            ])
            ->where('people_id', $people_id);

            // Zonal scope filtering
            if (!$this->isSuperAdmin($roles)) {
                $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);
                if ($zonalWorkplaceId) {
                    $this->applyTeacherZonalScope($query, $zonalWorkplaceId);
                }
            }

            $officer = $query->first();

            if (!$officer) {
                return response()->json(['status' => 'error', 'message' => 'School DEO not found'], 404);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $officer,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to fetch school deo'], 500);
        }
    }
}
