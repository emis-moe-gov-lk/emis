<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DivisionalEducationOffice;
use App\Models\Institution;
use App\Models\InstitutionAuthority;
use App\Models\ProvincialEducationOffice;
use App\Models\ZonalEducationOffice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class InstitutionController extends Controller
{
    /**
     * GET all institutions
     *
     * - super admin / admin: full paginated list with filters
     * - all other roles (e.g. teacher): only the institution they are assigned to
     */
    public function index(Request $request)
    {
        try {
        $authed = $request->user();
        $roles  = $request->attributes->get('jwt_roles', []);

        Log::debug('Institution index auth', [
            'roles'        => $roles,
            'workplace_id' => $authed?->currentAppointment?->workplace_id,
        ]);

        $with = [
            'zonalEducationOffice',
            'divisionalEducationOffice',
            'district',
            'institutionCategory',
            'authority',
            'institutionLanguages',
            'typeByGender',
            'policeStation',
            'mohArea',
            'institutionType',
            'gradeSpan',
        ];

        $isAdmin = in_array('super admin', $roles) || in_array('admin', $roles);
        $workplace = $authed?->currentAppointment?->workplace;
        $officeLevelId = $workplace?->office_level_id;
        $workplaceId = $workplace?->workplace_id;

        $query = Institution::with($with)->withCount('teachers');

        // Non-admin users: scope the list based on their office level
        if (!$isAdmin) {
            if (!$workplaceId) {
                return response()->json([
                    'status' => 'success',
                    'data'   => Institution::with($with)->whereRaw('0 = 1')->paginate(20)->withQueryString(),
                ]);
            }

            if ($officeLevelId === 'OLID006') {
                // School level: see only their own school
                $query->where('workplace_id', $workplaceId);
            } elseif ($officeLevelId === 'OLID005') {
                // Divisional level: see all schools in their division
                $query->where('deo_wp_id', $workplaceId);
            } elseif ($officeLevelId === 'OLID004') {
                // Zonal level: see all schools in their zone
                $query->where('zeo_wp_id', $workplaceId);
            } elseif ($officeLevelId === 'OLID003') {
                // Provincial level (PEO): see all schools in their province
                $query->whereHas('zonalEducationOffice', function ($q) use ($workplaceId) {
                    $q->where('peo_wp_id', $workplaceId);
                });
            } elseif ($officeLevelId === 'OLID002') {
                // Provincial level (PMOE): see all schools in their province
                $peo = ProvincialEducationOffice::where('pmoe_wp_id', $workplaceId)->first();
                if ($peo) {
                    $query->whereHas('zonalEducationOffice', function ($q) use ($peo) {
                        $q->where('peo_wp_id', $peo->workplace_id);
                    });
                } else {
                    $query->whereRaw('0 = 1');
                }
            }
        }

        /* -------------------------
        | Filters
        |--------------------------*/
        if ($request->filled('active_status')) {
            $query->where('active_status', (int) $request->active_status);
        }

        if ($request->filled('peo_wp_id')) {
            $query->whereHas('zonalEducationOffice', function ($q) use ($request) {
                $q->where('peo_wp_id', $request->peo_wp_id);
            });
        }

        if ($request->filled('zeo_wp_id')) {
            $query->where('zeo_wp_id', $request->zeo_wp_id);
        }

        if ($request->filled('deo_wp_id')) {
            $query->where('deo_wp_id', $request->deo_wp_id);
        }

        if ($request->filled('district_id')) {
            $query->where('district_id', $request->district_id);
        }

        if ($request->filled('category_id')) {
            $query->where('institution_category_id', $request->category_id);
        }

        if ($request->filled('authority_id')) {
            $query->where('authority_id', $request->authority_id);
        }

        if ($request->filled('type_id')) {
            $query->where('institution_types_id', $request->type_id);
        }

        /* -------------------------
        | SEARCH
        |--------------------------*/
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('workplace_id', 'like', "%{$search}%")
                    ->orWhere('census_No', 'like', "%{$search}%");
            });
        }

        /* -------------------------
        | Pagination
        |--------------------------*/
        $institutions = $query
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return response()->json([
            'status' => 'success',
            'data'   => $institutions,
        ]);
        } catch (\Throwable $e) {
            Log::error('Institution index error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch institutions',
            ], 500);
        }
    }



    /**
     * GET filter options for institution dropdowns (role-scoped)
     */
    public function filters(Request $request)
    {
        $authed = $request->user();
        $roles  = $request->attributes->get('jwt_roles', []);

        $isAdmin    = in_array('super admin', $roles) || in_array('admin', $roles);
        $isZonalDeo = in_array('Zonal DEO', $roles) || in_array('zonal deo head', $roles);
        $isDeo      = in_array('development officer', $roles) || in_array('development officer head', $roles);

        $workplaceId = $authed?->currentAppointment?->workplace_id;

        $authorities = InstitutionAuthority::active()
            ->orderBy('authority_name')
            ->get(['authority_id', 'authority_name']);

        if ($isAdmin) {
            return response()->json([
                'status' => 'success',
                'data'   => [
                    'authorities' => $authorities,
                    'provinces'   => ProvincialEducationOffice::active()
                        ->orderBy('name')
                        ->get(['workplace_id', 'short_name']),
                    'zones'       => ZonalEducationOffice::active()
                        ->orderBy('name')
                        ->get(['workplace_id', 'short_name', 'peo_wp_id']),
                    'divisions'   => DivisionalEducationOffice::active()
                        ->orderBy('name')
                        ->get(['workplace_id', 'name', 'zeo_wp_id']),
                ],
            ]);
        }

        if ($isZonalDeo) {
            $zone = ZonalEducationOffice::where('workplace_id', $workplaceId)
                ->first(['workplace_id', 'short_name', 'peo_wp_id']);

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'authorities' => $authorities,
                    'zones'       => $zone ? [$zone] : [],
                    'divisions'   => $zone
                        ? DivisionalEducationOffice::active()
                            ->where('zeo_wp_id', $workplaceId)
                            ->orderBy('name')
                            ->get(['workplace_id', 'name', 'zeo_wp_id'])
                        : [],
                ],
            ]);
        }

        if ($isDeo) {
            $division = DivisionalEducationOffice::where('workplace_id', $workplaceId)
                ->first(['workplace_id', 'name', 'zeo_wp_id']);

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'authorities' => $authorities,
                    'divisions'   => $division ? [$division] : [],
                ],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => ['authorities' => $authorities],
        ]);
    }

    /**
     * GET a single institution
     */
    public function show($id)
    {
        $institution = Institution::with([
            'zonalEducationOffice',
            'divisionalEducationOffice',
            'district',
            'institutionCategory',
            'authority',
            'institutionLanguages',
            'typeByGender',
            'policeStation',
            'mohArea',
            'institutionType',
            'gradeSpan'
        ])->find($id);

        if (!$institution) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Institution not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $institution
        ]);
    }

    /**
     * UPDATE institution
     */
    public function update(Request $request, $id)
    {
        $institution = Institution::find($id);

        if (!$institution) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Institution not found'
            ], 404);
        }

        // Validation rules
        $validated = $request->validate([
            'census_no'              => 'nullable|string|max:20',
            'institution_category_id' => 'nullable|string',
            'authority_id'           => 'nullable|string',
            'language_id'            => 'nullable|string',
            'ethnicity_id'           => 'nullable|string',
            'gender_id'              => 'nullable|string',
            'institution_types_id'   => 'nullable|string',
            'grade_span_id'          => 'nullable|string',
            'sport_s'                => 'nullable|string',
            'district_id'            => 'nullable|string',
            'zeo_wp_id'              => 'nullable|string',
            'deo_wp_id'              => 'nullable|string',
            'police_station_id'      => 'nullable|string',
            'moh_area_id'            => 'nullable|string',
            'name'                   => 'required|string|max:255',
            'short_name'             => 'nullable|string|max:100',
            'established_year'       => 'nullable|integer',
            'email'                  => 'nullable|email|max:255',
            'phone'                  => 'nullable|string|max:20',
            'address'                => 'nullable|string',
            'postal_code'            => 'nullable|string|max:10',
            'latitude'               => 'nullable|string|max:20',
            'longitude'              => 'nullable|string|max:20',
            'mission'                => 'nullable|string',
            'vision'                 => 'nullable|string',
            'logo'                   => 'nullable|string',
            'active_status'          => 'required|boolean',
        ]);

        $institution->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Institution updated successfully',
            'data'    => $institution
        ]);
    }
}
