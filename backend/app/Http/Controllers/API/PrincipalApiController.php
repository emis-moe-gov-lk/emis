<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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

            $baseQuery = People::query()->whereHas('principal');
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
}