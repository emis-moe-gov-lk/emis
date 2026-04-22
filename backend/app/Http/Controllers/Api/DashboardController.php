<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DivisionalEducationOffice;
use App\Models\Institution;
use App\Models\People;
use App\Models\ProvincialEducationOffice;
use App\Models\ProvincialMinistryOfEducationOffice;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Workplaces;
use App\Models\ZonalEducationOffice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(Request $request, string $people_id)
    {
        $authUser = auth()->user();
        $authPeopleId = $request->attributes->get('jwt_people_id') ?? $authUser?->people_id;

        \Log::debug($people_id);
        \Log::debug($authPeopleId);

        if (! $authUser || ! $authPeopleId) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        // Some clients send a stale/mismatched path value during bootstrap.
        $people_id = $authPeopleId;

        $people = People::where('people_id', $people_id)->first();

        if (!$people) {
            return response()->json(['status' => 'error', 'message' => 'Person not found'], 404);
        }

        $currentAppointment = $people->currentAppointment;

        if (!$currentAppointment) {
            return response()->json(['status' => 'error', 'message' => 'No current appointment found'], 404);
        }

        $user  = User::where('people_id', $people_id)->first();


        // Verify the primary JWT role matches the DB role for this people_id
        $jwtRoles = collect((array) $request->attributes->get('jwt_roles', []))
            ->map(fn ($role) => strtolower((string) $role))
            ->filter()
            ->values();

        $roles = $user
            ? $user->roles->pluck('name')->map(fn ($role) => strtolower((string) $role))->values()->all()
            : [];

        if (! empty($roles) && $jwtRoles->intersect($roles)->isEmpty()) {
            return response()->json(['status' => 'error', 'message' => 'Role mismatch'], 403);
        }

        $appointment  = $currentAppointment->appointment;
        $isVerified   = $appointment?->is_verified ?? false;
        $isConfirmed  = $appointment?->is_confirmed ?? false;

        $workplace = Workplaces::where('workplace_id', $currentAppointment->workplace_id)->first();



        $base = [
            'people_id'    => $people_id,
            'name'         => $people->name_with_initials,
            'roles'        => $roles,
            'is_verified'  => $isVerified,
            'is_confirmed' => $isConfirmed,
        ];

        if (array_intersect($roles, ['teacher', 'principal'])) {
            return response()->json([
                'status' => 'success',
                'data'   => array_merge($base, $this->institutionData($workplace, $roles)),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => array_merge($base, $this->adminData($workplace)),
        ]);


    }



    private function institutionData(Workplaces $workplace, array $roles): array
    {

        $workplaceId  = $workplace->workplace_id;
        $institution  = $workplace->institution;
        $chilWorkpalceList = $workplace->getAllChildWorkplaces();
        $institutionCount = Institution::whereIn('workplace_id', $chilWorkpalceList)->active()->count();
        $teacherCount = Teacher::whereHas('currentAppointment', function ($q) use ($workplaceId) {
            $q->where('workplace_id', $workplaceId);
        })->count();

        if($workplace->office_level_id == 'OLID001'){
            $officeLists = ProvincialMinistryOfEducationOffice::query()
                ->whereIn('provincial_ministry_of_education_offices.workplace_id', $chilWorkpalceList)
                ->leftJoin(
                    'provincial_education_offices',
                    'provincial_education_offices.pmoe_wp_id',
                    '=',
                    'provincial_ministry_of_education_offices.workplace_id'
                )
                ->leftJoin(
                    'zonal_education_offices',
                    'zonal_education_offices.peo_wp_id',
                    '=',
                    'provincial_education_offices.workplace_id'
                )
                ->leftJoin(
                    'divisional_education_offices',
                    'divisional_education_offices.zeo_wp_id',
                    '=',
                    'zonal_education_offices.workplace_id'
                )
                ->leftJoin(
                    'institutions',
                    'institutions.deo_wp_id',
                    '=',
                    'divisional_education_offices.workplace_id'
                )

                ->select([
                    'provincial_ministry_of_education_offices.short_name',
                    'provincial_ministry_of_education_offices.id',
                    DB::raw('COUNT(DISTINCT zonal_education_offices.id) as total_zeo'),
                    DB::raw('COUNT(DISTINCT divisional_education_offices.id) as total_deo'),
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])

                ->groupBy('provincial_ministry_of_education_offices.short_name')
                ->groupBy('provincial_ministry_of_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get();


            //dd($officeLists);
        }
        elseif($workplace->office_level_id == 'OLID002'){
            $officeLists = ProvincialEducationOffice::query()
                ->whereIn('provincial_education_offices.workplace_id', $chilWorkpalceList)
                ->leftJoin(
                    'zonal_education_offices',
                    'zonal_education_offices.peo_wp_id',
                    '=',
                    'provincial_education_offices.workplace_id'
                )
                ->leftJoin(
                    'divisional_education_offices',
                    'divisional_education_offices.zeo_wp_id',
                    '=',
                    'zonal_education_offices.workplace_id'
                )
                ->leftJoin(
                    'institutions',
                    'institutions.deo_wp_id',
                    '=',
                    'divisional_education_offices.workplace_id'
                )

                ->select([
                    'provincial_education_offices.short_name',
                    'provincial_education_offices.id',
                    DB::raw('COUNT(DISTINCT zonal_education_offices.id) as total_zeo'),
                    DB::raw('COUNT(DISTINCT divisional_education_offices.id) as total_deo'),
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])

                ->groupBy('provincial_education_offices.short_name')
                ->groupBy('provincial_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get();
        }
        elseif($workplace->office_level_id == 'OLID003'){
            $officeLists = ZonalEducationOffice::query()
                ->whereIn('zonal_education_offices.workplace_id', $chilWorkpalceList)
                ->leftJoin(
                    'divisional_education_offices',
                    'divisional_education_offices.zeo_wp_id',
                    '=',
                    'zonal_education_offices.workplace_id'
                )
                ->leftJoin(
                    'institutions',
                    'institutions.deo_wp_id',
                    '=',
                    'divisional_education_offices.workplace_id'
                )

                ->select([
                    'zonal_education_offices.short_name',
                    'zonal_education_offices.id',
                    DB::raw('COUNT(DISTINCT divisional_education_offices.id) as total_deo'),
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])

                ->groupBy('zonal_education_offices.short_name')
                ->groupBy('zonal_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get();
        }
        elseif($workplace->office_level_id == 'OLID004'){
            $officeLists = DivisionalEducationOffice::query()
                ->whereIn('divisional_education_offices.workplace_id', $chilWorkpalceList)
                ->leftJoin(
                    'institutions',
                    'institutions.deo_wp_id',
                    '=',
                    'divisional_education_offices.workplace_id'
                )

                ->select([
                    'divisional_education_offices.short_name',
                    'divisional_education_offices.id',
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])

                ->groupBy('divisional_education_offices.short_name')
                ->groupBy('divisional_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get();
        }
        elseif($workplace->office_level_id == 'OLID005' || $workplace->office_level_id == 'OLID006'){
            $officeLists = Institution::query()
                ->whereIn('institutions.workplace_id', $chilWorkpalceList)
                ->leftJoin(
                    'employer_current_appointments',
                    'employer_current_appointments.workplace_id',
                    '=',
                    'institutions.workplace_id'
                )
                ->select([
                    'institutions.name',
                    'institutions.id',
                    DB::raw('COUNT(DISTINCT employer_current_appointments.id) as total_staff'),
                ])

                ->groupBy('institutions.name')
                ->groupBy('institutions.id')
                ->orderBy('total_staff', 'desc')
                ->get();
        }

        return [
            'view_type'   => in_array('teacher', $roles) ? 'teacher' : 'principal',
            'institution' => [
                'name'          => $institution?->name,
                'workplace_id'  => $workplaceId,
                'institution_count' => $institutionCount,
                'teacher_count' => $teacherCount,
                'student_count' => null, // no student table yet
            ],
            'office_list' => $officeLists
        ];
    }

    private function adminData(Workplaces $workplace): array
    {
        $officeLevelId   = $workplace->office_level_id;
        $childWorkplaces = $workplace->getAllChildWorkplaces();

        $institutionCount = Institution::whereIn('workplace_id', $childWorkplaces)->active()->count();
        $teacherCount     = Teacher::whereHas('currentAppointment', function ($q) use ($childWorkplaces) {
            $q->whereIn('workplace_id', $childWorkplaces);
        })->count();

        if ($officeLevelId === 'OLID005') {
            return $this->deoOfficerData($workplace, $institutionCount, $teacherCount);
        }

        $breakdown = match ($officeLevelId) {
            'OLID001' => ProvincialMinistryOfEducationOffice::query()
                ->whereIn('provincial_ministry_of_education_offices.workplace_id', $childWorkplaces)
                ->leftJoin('provincial_education_offices', 'provincial_education_offices.pmoe_wp_id', '=', 'provincial_ministry_of_education_offices.workplace_id')
                ->leftJoin('zonal_education_offices', 'zonal_education_offices.peo_wp_id', '=', 'provincial_education_offices.workplace_id')
                ->leftJoin('divisional_education_offices', 'divisional_education_offices.zeo_wp_id', '=', 'zonal_education_offices.workplace_id')
                ->leftJoin('institutions', 'institutions.deo_wp_id', '=', 'divisional_education_offices.workplace_id')
                ->select([
                    'provincial_ministry_of_education_offices.short_name',
                    'provincial_ministry_of_education_offices.id',
                    DB::raw('COUNT(DISTINCT zonal_education_offices.id) as total_zeo'),
                    DB::raw('COUNT(DISTINCT divisional_education_offices.id) as total_deo'),
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])
                ->groupBy('provincial_ministry_of_education_offices.short_name', 'provincial_ministry_of_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get(),

            'OLID002' => ProvincialEducationOffice::query()
                ->whereIn('provincial_education_offices.workplace_id', $childWorkplaces)
                ->leftJoin('zonal_education_offices', 'zonal_education_offices.peo_wp_id', '=', 'provincial_education_offices.workplace_id')
                ->leftJoin('divisional_education_offices', 'divisional_education_offices.zeo_wp_id', '=', 'zonal_education_offices.workplace_id')
                ->leftJoin('institutions', 'institutions.deo_wp_id', '=', 'divisional_education_offices.workplace_id')
                ->select([
                    'provincial_education_offices.short_name',
                    'provincial_education_offices.id',
                    DB::raw('COUNT(DISTINCT zonal_education_offices.id) as total_zeo'),
                    DB::raw('COUNT(DISTINCT divisional_education_offices.id) as total_deo'),
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])
                ->groupBy('provincial_education_offices.short_name', 'provincial_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get(),

            'OLID003' => ZonalEducationOffice::query()
                ->whereIn('zonal_education_offices.workplace_id', $childWorkplaces)
                ->leftJoin('divisional_education_offices', 'divisional_education_offices.zeo_wp_id', '=', 'zonal_education_offices.workplace_id')
                ->leftJoin('institutions', 'institutions.deo_wp_id', '=', 'divisional_education_offices.workplace_id')
                ->select([
                    'zonal_education_offices.short_name',
                    'zonal_education_offices.id',
                    DB::raw('COUNT(DISTINCT divisional_education_offices.id) as total_deo'),
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])
                ->groupBy('zonal_education_offices.short_name', 'zonal_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get(),

            'OLID004' => DivisionalEducationOffice::query()
                ->whereIn('divisional_education_offices.workplace_id', $childWorkplaces)
                ->leftJoin('institutions', 'institutions.deo_wp_id', '=', 'divisional_education_offices.workplace_id')
                ->select([
                    'divisional_education_offices.short_name',
                    'divisional_education_offices.id',
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])
                ->groupBy('divisional_education_offices.short_name', 'divisional_education_offices.id')
                ->orderBy('total_institutions', 'desc')
                ->get(),

            default => collect(),
        };

        return [
            'view_type'        => 'admin',
            'summary'          => [
                'institution_count' => $institutionCount,
                'teacher_count'     => $teacherCount,
            ],
            'office_breakdown' => $breakdown,
        ];
    }

    private function deoOfficerData(Workplaces $workplace, int $institutionCount, int $teacherCount): array
    {
        $deo = DivisionalEducationOffice::where('workplace_id', $workplace->workplace_id)->first();

        $zoneInfo      = null;
        $zoneBreakdown = collect();

        if ($deo && $deo->zeo_wp_id) {
            $zeo      = ZonalEducationOffice::where('workplace_id', $deo->zeo_wp_id)->first();
            $zoneInfo = $zeo
                ? ['name' => $zeo->name, 'workplace_id' => $zeo->workplace_id]
                : null;

            $zoneBreakdown = DivisionalEducationOffice::query()
                ->where('divisional_education_offices.zeo_wp_id', $deo->zeo_wp_id)
                ->leftJoin('institutions', 'institutions.deo_wp_id', '=', 'divisional_education_offices.workplace_id')
                ->select([
                    'divisional_education_offices.short_name',
                    'divisional_education_offices.id',
                    'divisional_education_offices.workplace_id',
                    DB::raw('COUNT(DISTINCT institutions.id) as total_institutions'),
                ])
                ->groupBy(
                    'divisional_education_offices.short_name',
                    'divisional_education_offices.id',
                    'divisional_education_offices.workplace_id'
                )
                ->orderBy('total_institutions', 'desc')
                ->get();
        }

        return [
            'view_type' => 'admin',
            'summary'   => [
                'institution_count' => $institutionCount,
                'teacher_count'     => $teacherCount,
            ],
            'zone'             => $zoneInfo,
            'office_breakdown' => $zoneBreakdown,
        ];
    }
}
