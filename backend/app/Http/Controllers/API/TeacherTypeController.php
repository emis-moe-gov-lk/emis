<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TeacherType;
use Illuminate\Http\Request;

class TeacherTypeController extends Controller
{
    /**
     * GET all teacher types
     */
    public function index(Request $request)
    {
        $active = $request->query('active');

        $query = TeacherType::query();

        if ($active == "1") {
            $query->active();
        }

        $types = $query->orderBy('type_name')->get();

        return response()->json([
            'status' => 'success',
            'count'  => $types->count(),
            'data'   => $types,
        ], 200);
    }

    /**
     * GET a single teacher type
     */
    public function show($id)
    {
        $type = TeacherType::find($id);

        if (!$type) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Teacher type not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $type,
        ], 200);
    }

    /**
     * UPDATE teacher type
     */
    public function update(Request $request, $id)
    {
        $type = TeacherType::find($id);

        if (!$type) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Teacher type not found',
            ], 404);
        }

        $validated = $request->validate([
            'teacher_types_id' => 'nullable|string|max:10',
            'type_name'        => 'required|string|max:100',
            'active_status'    => 'required|boolean',
        ]);

        $type->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Teacher type updated successfully',
            'data'    => $type,
        ], 200);
    }
}
