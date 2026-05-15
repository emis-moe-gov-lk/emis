<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Child;

class ChildController extends Controller
{
    public function store(Request $request, string $people_id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|in:Male,Female',
            'status' => 'required|string',
        ]);

        try {
            $child = Child::create([
                'people_id' => $people_id,
                'name' => $validated['name'],
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'status' => $validated['status'],
            ]);

            return response()->json(['status' => 'success', 'data' => $child], 201);
        } catch (\Throwable $e) {
            Log::error('Add Child Error', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Failed to add child'], 500);
        }
    }

    public function update(Request $request, string $people_id, $child_id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|in:Male,Female',
            'status' => 'required|string',
        ]);

        try {
            $child = Child::where('id', $child_id)->where('people_id', $people_id)->firstOrFail();
            $child->update($validated);
            return response()->json(['status' => 'success', 'data' => $child]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to update child'], 500);
        }
    }

    public function destroy(string $people_id, $child_id)
    {
        try {
            $child = Child::where('id', $child_id)->where('people_id', $people_id)->firstOrFail();
            $child->update(['status' => 'Inactive']);
            return response()->json(['status' => 'success', 'message' => 'Child status updated to Inactive.']);
        } catch (\Throwable $e) {
            Log::error('Delete Child Error', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Failed to remove child: ' . $e->getMessage()], 500);
        }
    }
}