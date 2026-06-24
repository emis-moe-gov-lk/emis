<?php

namespace App\Http\Controllers\MessageService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Resolves message-service recipient scopes to WSO2 UUIDs.
 *
 * The Node.js message-service calls these endpoints when dispatching a
 * notification, so it can write one row per recipient into its own DB
 * without having access to the Laravel people/appointment tables.
 *
 * Scope shape:
 *   { "type": "all" }
 *   { "type": "school",   "workplaceId": "WP_..." }
 *   { "type": "division", "workplaceId": "WP_..." }
 *   { "type": "zone",     "workplaceId": "WP_..." }
 *   { "type": "province", "workplaceId": "WP_..." }
 */
class ScopeController extends Controller
{
    /**
     * POST /api/message-service/resolve-recipients
     *
     * Body: { "scope": { "type": "zone", "workplaceId": "WP_ZEO_001" } }
     * Returns: { success: true, data: { uuids: [...], count: N } }
     */
    public function resolveRecipients(Request $request)
    {
        $request->validate([
            'scope'               => ['required', 'array'],
            'scope.type'          => ['required', 'string', 'in:all,province,zone,division,school'],
            'scope.workplaceId'   => ['required_unless:scope.type,all', 'nullable', 'string'],
        ]);

        $uuids = $this->queryUuids($request->input('scope'));

        return response()->json([
            'success' => true,
            'data'    => ['uuids' => $uuids, 'count' => count($uuids)],
        ]);
    }

    /**
     * POST /api/message-service/estimate-reach
     *
     * Same body as resolveRecipients but returns only the count (fast path for
     * the composer's "estimated recipients" display).
     */
    public function estimateReach(Request $request)
    {
        $request->validate([
            'scope'               => ['required', 'array'],
            'scope.type'          => ['required', 'string', 'in:all,province,zone,division,school'],
            'scope.workplaceId'   => ['required_unless:scope.type,all', 'nullable', 'string'],
        ]);

        $count = $this->queryCount($request->input('scope'));

        return response()->json([
            'success' => true,
            'data'    => ['count' => $count],
        ]);
    }

    // -------------------------------------------------------------------------

    private function queryUuids(array $scope): array
    {
        return DB::table('people')
            ->join('employer_current_appointments as eca', 'people.people_id', '=', 'eca.employee_id')
            ->whereNotNull('people.uuid')
            ->where('people.active_status', 1)
            ->when($scope['type'] !== 'all', function ($q) use ($scope) {
                $this->applyWorkplaceFilter($q, $scope);
            })
            ->pluck('people.uuid')
            ->all();
    }

    private function queryCount(array $scope): int
    {
        return DB::table('people')
            ->join('employer_current_appointments as eca', 'people.people_id', '=', 'eca.employee_id')
            ->whereNotNull('people.uuid')
            ->where('people.active_status', 1)
            ->when($scope['type'] !== 'all', function ($q) use ($scope) {
                $this->applyWorkplaceFilter($q, $scope);
            })
            ->count();
    }

    private function applyWorkplaceFilter($query, array $scope): void
    {
        $wpId = $scope['workplaceId'];

        match ($scope['type']) {
            'school' => $query->where('eca.workplace_id', $wpId),

            'division' => $query->whereIn('eca.workplace_id',
                DB::table('institutions')
                    ->where('deo_wp_id', $wpId)
                    ->pluck('workplace_id')
            ),

            'zone' => $query->whereIn('eca.workplace_id',
                DB::table('institutions')
                    ->where('zeo_wp_id', $wpId)
                    ->pluck('workplace_id')
            ),

            'province' => $query->whereIn('eca.workplace_id',
                DB::table('institutions')
                    ->whereIn('zeo_wp_id',
                        DB::table('zonal_education_offices')
                            ->where('peo_wp_id', $wpId)
                            ->pluck('workplace_id')
                    )
                    ->pluck('workplace_id')
            ),

            default => null,
        };
    }
}
