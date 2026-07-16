<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DivisionalEducationOffice;
use App\Models\Institution;
use App\Models\InstitutionAuthority;
use App\Models\ProvincialEducationOffice;
use App\Models\ZonalEducationOffice;
use App\Models\DistrictsList;
use App\Models\InstitutionCategory;
use App\Models\InstitutionGender;
use App\Models\InstitutionLanguages;
use App\Models\InstitutionType;
use App\Models\InstitutionEthnisity;
use App\Models\InstitutionalFacility;
use App\Models\GradeSpan;
use App\Models\GnDivision;
use App\Models\PoliceStation;
use App\Models\MohArea;
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
     * this has the both logics
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

            $institutions = $query->orderBy('name')->paginate(20)->withQueryString();

            return response()->json([
                'status' => 'success',
                'data'   => $institutions,
            ]);
        }

        // Non-admin users: return only their assigned institution
        if (! $isAdmin) {
            $workplaceId = $authed?->currentAppointment?->workplace_id;

            if (! $workplaceId) {
                return response()->json([
                    'status' => 'success',
                    'data'   => Institution::with($with)->whereRaw('0 = 1')->paginate(20)->withQueryString(),
                ]);
            }

            $cacheKey = "institution_by_workplace_{$workplaceId}";
            Log::debug('[Cache] ' . (Cache::has($cacheKey) ? 'HIT' : 'MISS') . " key={$cacheKey}");

            $dbQuery = fn () => Institution::with($with)
                ->withCount('teachers')
                ->where('workplace_id', $workplaceId)
                ->paginate(20)
                ->withQueryString();

            try {
                $institutions = Cache::remember($cacheKey, now()->addMinutes(30), $dbQuery);
            } catch (\Throwable $e) {
                Log::warning('[Cache] Redis unavailable, falling back to DB', ['key' => $cacheKey, 'error' => $e->getMessage()]);
                $institutions = $dbQuery();
            }

            return response()->json([
                'status' => 'success',
                'data'   => $institutions,
            ]);
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
                    'districts'   => DistrictsList::all(['district_id', 'district_name']),
                    'categories'  => InstitutionCategory::all(['institution_category_id', 'institution_category_name']),
                    'genders'     => InstitutionGender::all(['gender_id', 'name']),
                    'languages'   => InstitutionLanguages::all(['language_id', 'name']),
                    'types'       => InstitutionType::all(['institution_types_id', 'institution_types_name']),
                    'ethnicities' => InstitutionEthnisity::all(['ethnicity_id', 'ethnicity_name']),
                    'facilities'  => InstitutionalFacility::all(['facilities_id', 'name']),
                    'gradeSpans'  => GradeSpan::all(['grade_span_id', 'grade_span_name']),
                    'gnDivisions' => GnDivision::active()
                        ->orderBy('gn_division_name')
                        ->get(['gn_division_id', 'gn_division_name']),
                    'policeStations' => PoliceStation::active()
                        ->orderBy('police_station_name')
                        ->get(['police_station_id', 'police_station_name']),
                    'mohAreas' => MohArea::active()
                        ->orderBy('moh_area_name')
                        ->get(['moh_area_id', 'moh_area_name']),
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'workplace_id'           => 'required|string|max:10|unique:institutions,workplace_id',
            'census_no'              => 'required|string|max:10|unique:institutions,census_no',
            'category_id'            => 'required|string',
            'authority_id'           => 'required|string',
            'language_id'            => 'required|string',
            'ethnicity_id'           => 'required|string',
            'gender_id'              => 'required|string',
            'type_id'                => 'required|string',
            'gradespan'              => 'nullable|string',
            'facility_id'            => 'required|string',
            'district_id'            => 'required|string',
            'zeo_wp_id'              => 'required|string',
            'deo_wp_id'              => 'required|string',
            'gn_division_id'         => 'nullable|string',
            'police_station_id'      => 'nullable|string',
            'moh_area_id'            => 'nullable|string',
            'name'                   => 'required|string|max:255',
            'other_name'             => 'nullable|string|max:50',
            'established_year'       => 'required|string',
            'email'                  => 'nullable|email|max:255',
            'contact_number'         => 'nullable|string|max:20',
            'address'                => 'nullable|string',
            'postal_code'            => 'nullable|string|max:10',
            'latitude'               => 'nullable|numeric',
            'longitude'              => 'nullable|numeric',
            'mission'                => 'nullable|string',
            'vision'                 => 'nullable|string',
            'logo'                   => 'nullable|string',
            'active_status'          => 'required|string',
        ]);

        $data = [
            'workplace_id' => $validated['workplace_id'],
            'census_no' => $validated['census_no'],
            'institution_category_id' => $validated['category_id'],
            'authority_id' => $validated['authority_id'],
            'language_id' => $validated['language_id'],
            'ethnicity_id' => $validated['ethnicity_id'],
            'gender_id' => $validated['gender_id'],
            'facilities_id' => $validated['facility_id'],
            'institution_types_id' => $validated['type_id'],
            'grade_span_id' => $validated['gradespan'] ?? null,
            'sport_s' => '0',
            'district_id' => $validated['district_id'],
            'zeo_wp_id' => $validated['zeo_wp_id'],
            'deo_wp_id' => $validated['deo_wp_id'],
            'gn_division_id' => $validated['gn_division_id'] ?? null,
            'police_station_id' => $validated['police_station_id'] ?? null,
            'moh_area_id' => $validated['moh_area_id'] ?? null,
            'name' => $validated['name'],
            'other_name' => $validated['other_name'] ?? null,
            'established_year' => $validated['established_year'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'mission' => $validated['mission'] ?? null,
            'vision' => $validated['vision'] ?? null,
            'logo' => $validated['logo'] ?? null,
            'active_status' => (int) $validated['active_status'],
            'created_by' => $request->user()->people_id ?? 'system',
            'updated_by' => $request->user()->people_id ?? 'system',
        ];

        $institution = Institution::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Institution created successfully',
            'data' => $institution,
        ], 201);
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
