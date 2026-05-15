<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Spouse; // Make sure this matches your exact model name

class SpouseController extends Controller
{
    public function store(Request $request, string $people_id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'married_date' => 'required|date',
            'married_cf_no' => 'nullable|string|max:255',
            'status' => 'required|string',
        ]);

        if ($validated['status'] === 'Active' && \App\Models\Spouse::where('people_id', $people_id)->where('status', 'Active')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'An active spouse record already exists for this person.',
            ], 422);
        }

        try {
            $spouse = Spouse::create([
                'people_id' => $people_id,
                'name' => $validated['name'],
                'date_of_birth' => $validated['date_of_birth'],
                'married_date' => $validated['married_date'],
                'married_cf_no' => $validated['married_cf_no'],
                'status' => $validated['status'],
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Spouse added successfully',
                'data' => $spouse
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Add Spouse Error', ['message' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add spouse: ' . $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function update(Request $request, string $people_id, $spouse_id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'married_date' => 'required|date',
            'married_cf_no' => 'nullable|string|max:255',
            'status' => 'required|string',
        ]);

        try {
            $spouse = Spouse::where('id', $spouse_id)->where('people_id', $people_id)->firstOrFail();
            $spouse->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Spouse updated successfully',
                'data' => $spouse
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update spouse: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $people_id, $spouse_id)
    {
        try {
            $spouse = Spouse::where('id', $spouse_id)->where('people_id', $people_id)->firstOrFail();
            $spouse->update(['status' => 'Inactive']);
            return response()->json(['status' => 'success', 'message' => 'Spouse status updated to Inactive.']);
        } catch (\Throwable $e) {
            Log::error('Delete Spouse Error', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Failed to remove spouse: ' . $e->getMessage()], 500);
        }
    }
}
