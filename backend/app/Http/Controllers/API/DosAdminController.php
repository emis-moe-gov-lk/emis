<?php

namespace App\Http\Controllers\API;

use Carbon\Carbon;
use App\Models\User;
use App\Models\People;
use App\Models\Position;
use App\Helpers\NicHelper;
use App\Models\EmployerAppointment;
use App\Models\EmployerCurrentAppointment;
use App\Models\DivisionalSecretariatOffice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;

class DosAdminController extends Controller
{
    private const SLEAS_SERVICE_ID  = 'SER005';
    private const ZONAL_OFFICE_LEVEL = 'OLID004';

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

        if (str_contains($lowerName, 'deputy') || str_contains($lowerName, 'assistant')) {
            return 'zonal deputy director';
        }

        return 'zonal director';
    }

    // ==============================
    // LIST
    // ==============================

    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 20);
            $nic     = trim($request->get('nic', ''));

            $dosAdminPeopleIds = User::query()
                ->whereHas('roles', function ($query) {
                    $query->whereIn('name', ['zonal director', 'zonal deputy director']);
                })
                ->pluck('people_id');

            $query = People::query()
                ->whereIn('people_id', $dosAdminPeopleIds)
                ->with([
                    'title',
                    'gender',
                    'appointment',
                    'currentAppointment.service',
                    'currentAppointment.rank',
                    'currentAppointment.position',
                    'currentAppointment.workplace',
                ])
                ->when($nic !== '', function ($q) use ($nic) {
                    $normalized = NicHelper::normalize($nic);
                    if (NicHelper::checkNicValid($normalized)) {
                        $q->where('nic_hash', NicHelper::hash($normalized));
                    }
                });

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
            Log::error('DOS Admin List Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch DOS admin list',
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
            ])->where('people_id', $people_id)->first();

            if (! $admin) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'DOS admin not found',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data'   => $admin,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('DOS Admin Show Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch DOS admin profile',
            ], 500);
        }
    }

    // ==============================
    // STORE
    // ==============================

    public function store(Request $request)
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

                // FIRST APPOINTMENT
                'firstAppointmentDate'     => 'required|date',
                'firstAppointmentLetter'   => 'required|string',
                'firstAppointmentService'  => 'required|string',
                'firstAppointmentRank'     => 'required|string',
                'firstAppointmentOfficeLevel' => 'required|string',
                'firstAppointmentWorkplace'   => 'required|string',
                'firstAppointmentPosition'    => 'required|string',
                'recruitmentCategory'      => 'required|string',
                'recruitmentSubject'       => 'required|string',

                // CURRENT APPOINTMENT
                'currentAppointmentDate'         => 'required|date',
                'currentAppointmentLetter'       => 'required|string',
                'currentAppointmentRank'         => 'required|string',
                'currentAppointmentWorkplace'    => 'required|string',
                'currentAppointmentPosition'     => 'required|string',
            ]);

            DB::beginTransaction();

            // ==============================
            // PEOPLE
            // ==============================
            $nic      = NicHelper::normalize($validated['nic']);
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

            // ==============================
            // FIRST APPOINTMENT
            // ==============================
            $retirementDate = Carbon::parse($people->date_of_birth)->addYears(55);
            $appointmentId  = EmployerAppointment::generateAppointmentId($validated['firstAppointmentDate']);

            EmployerAppointment::create([
                'appointment_id'          => $appointmentId,
                'employee_id'             => $people->people_id,
                'first_appointment_date'  => $validated['firstAppointmentDate'],
                'retirement_date'         => $retirementDate->toDateString(),
                'service_id'              => $validated['firstAppointmentService'],
                'rank_id'                 => $validated['firstAppointmentRank'],
                'position_id'             => $validated['firstAppointmentPosition'],
                'office_level_id'         => $validated['firstAppointmentOfficeLevel'],
                'workplace_id'            => $validated['firstAppointmentWorkplace'],
                'appointment_letter_no'   => $validated['firstAppointmentLetter'],
                'appointment_letter'      => 'none.pdf',
                'recruitment_category_id' => $validated['recruitmentCategory'],
                'recruitment_subject_id'  => $validated['recruitmentSubject'],
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
                'office_level_id'      => self::ZONAL_OFFICE_LEVEL,
                'position_id'          => $validated['currentAppointmentPosition'],
                'workplace_id'         => $validated['currentAppointmentWorkplace'],
            ]);

            // ==============================
            // SYSTEM USER
            // ==============================
            $role = $this->resolveRole($validated['currentAppointmentPosition']);

            $user = User::create([
                'nic'      => $nic,
                'nic_hash' => NicHelper::hash($nic),
                'people_id' => $people->people_id,
                'name'     => $people->name_with_initials,
                'email'    => strtolower($validated['email']),
                'contact'  => $validated['contact'],
                'password' => Hash::make('password@123'),
            ]);

            $user->assignRole($role);

            DB::commit();

            $positionName = Position::where('position_id', $validated['currentAppointmentPosition'])
                ->value('position_name');

            return response()->json([
                'status'  => 'success',
                'message' => 'Education administrator registered successfully',
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
                'default_password' => 'password@123',
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'validation_error',
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('DosAdmin Store Error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
