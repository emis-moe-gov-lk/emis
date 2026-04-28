<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DivisionalSecretariatOffice;
use App\Models\GnDivision;
use App\Models\People;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PrincipalApiController extends Controller
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

    private function isSuperAdmin(Request $request): bool
    {
        return in_array('super admin', $this->resolvedRoles($request), true);
    }

    public function principalList(Request $request)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
            ], 403);
        }

        try {
            $perPage = (int) $request->get('per_page', 20);
            $nic = trim((string) $request->get('nic', ''));

            $baseQuery = People::query()
                ->whereHas('principal')
                ->whereHas('appointment');
            $query = clone $baseQuery;

            if ($nic !== '') {
                $matchedPeopleIds = (clone $baseQuery)
                    ->select(['people_id', 'nic', 'full_name', 'name_with_initials'])
                    ->get()
                    ->filter(function (People $person) use ($nic) {
                        return str_contains((string) $person->nic, $nic)
                            || str_contains((string) $person->full_name, $nic)
                            || str_contains((string) $person->name_with_initials, $nic);
                    })
                    ->pluck('people_id')
                    ->values();

                $query->whereIn('people_id', $matchedPeopleIds);
            }

            $query->with([
                'principal.recruitmentCategory',
                'appointment',
                'currentAppointment.workplace.institution',
            ]);

            $principals = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $principals,
            ]);
        } catch (\Throwable $e) {
            Log::error('Principal List Fetch Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch principal list',
            ], 500);
        }
    }

    public function getPrincipal(Request $request, string $people_id)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
            ], 403);
        }

        try {
            $principal = People::query()
                ->with([
                    'title',
                    'gender',
                    'religion',
                    'ethnicity',
                    'civilStatus',
                    'bloodGroup',
                    'district',
                    'gnDivision.divisionalSecretariatOffice',
                    'myAppointments',
                    'appointment',
                    'currentAppointment',
                    'appointmentHistory',
                    'currentAppointment.workplace',
                    'currentAppointment.workplace.ministry',
                    'currentAppointment.workplace.provincial',
                    'currentAppointment.workplace.zonal',
                    'currentAppointment.workplace.divisional',
                    'currentAppointment.workplace.institution',
                    'teacher',
                    'teacher.appointmentSubject',
                    'teacher.mainSubject',
                    'teacher.secondarySubject',
                    'teacher.currentTeachingSubject',
                    'principal',
                    'principal.recruitmentCategory',
                ])
                ->whereHas('principal')
                ->whereHas('appointment')
                ->where('people_id', $people_id)
                ->first();

            if (! $principal) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Principal not found',
                ], 404);
            }

            $dsOfficeId = $principal?->ds_office_id;

            return response()->json([
                'status' => 'success',
                'data' => $principal,
                'divisionalSecretariats' => $principal?->district_id
                    ? DivisionalSecretariatOffice::where('district_id', $principal->district_id)
                        ->active()
                        ->get()
                    : [],
                'gnDivisions' => $dsOfficeId
                    ? GnDivision::where('dso_id', $dsOfficeId)
                        ->active()
                        ->get()
                    : [],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Principal Profile Fetch Error', [
                'people_id' => $people_id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch principal profile',
            ], 500);
        }
    }
}