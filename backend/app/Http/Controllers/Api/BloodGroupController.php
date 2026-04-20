<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BloodGroup;
use Illuminate\Http\Request;

class BloodGroupController extends Controller
{
    /**
     * GET all blood groups
     */
    public function index()
    {
        $bloodGroups = BloodGroup::orderBy('blood_group')->get();

        return response()->json([
            'status' => 'success',
            'count'  => $bloodGroups->count(),
            'data'   => $bloodGroups,
        ], 200);
    }

    /**
     * UPDATE blood group
     */
    public function update(Request $request, $id)
    {
        $bloodGroup = BloodGroup::find($id);

        if (!$bloodGroup) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Blood group not found',
            ], 404);
        }

        $validated = $request->validate([
            'blood_group_id' => 'nullable|string|max:10',
            'blood_group'    => 'required|string|max:10',
        ]);

        $bloodGroup->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Blood group updated successfully',
            'data'    => $bloodGroup,
        ], 200);
    }
}
