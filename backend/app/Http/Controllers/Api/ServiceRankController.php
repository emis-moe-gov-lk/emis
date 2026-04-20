<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ServiceRank;
use Illuminate\Http\Request;

class ServiceRankController extends Controller
{
    /**
     * GET all service ranks
     */
    public function index(Request $request)
    {
        $active = $request->query('active');
        $serviceId = $request->query('service_id');   // Optional filter

        $query = ServiceRank::with('service');

        if ($active == "1") {
            $query->active();
        }

        if ($serviceId) {
            $query->where('service_id', $serviceId);
        }

        $ranks = $query->orderBy('rank_name')->get();

        return response()->json([
            'status' => 'success',
            'count'  => $ranks->count(),
            'data'   => $ranks,
        ]);
    }

    /**
     * GET single rank
     */
    public function show($id)
    {
        $rank = ServiceRank::with('service')->find($id);

        if (!$rank) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Service rank not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $rank,
        ]);
    }

    /**
     * UPDATE service rank
     */
    public function update(Request $request, $id)
    {
        $rank = ServiceRank::find($id);

        if (!$rank) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Service rank not found',
            ], 404);
        }

        // Validate input data
        $validated = $request->validate([
            'rank_id'       => 'nullable|string|max:10',
            'service_id'    => 'required|string|exists:services,service_id',
            'rank_name'     => 'required|string|max:255',
            'description'   => 'nullable|string',
            'active_status' => 'required|boolean',
        ]);

        $rank->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Service rank updated successfully',
            'data'    => $rank,
        ]);
    }
}
