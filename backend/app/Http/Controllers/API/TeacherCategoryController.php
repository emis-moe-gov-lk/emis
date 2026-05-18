<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TeacherCategory;
use Illuminate\Http\Request;

class TeacherCategoryController extends Controller
{
    /**
     * GET all categories
     */
    public function index(Request $request)
    {
        // optional: ?active=1
        $active = $request->query('active');

        $query = TeacherCategory::query();

        if ($active == "1") {
            $query->active();
        }

        $categories = $query->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'count'  => $categories->count(),
            'data'   => $categories,
        ]);
    }

    /**
     * GET one category
     */
    public function show($id)
    {
        $category = TeacherCategory::find($id);

        if (!$category) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Teacher category not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $category,
        ]);
    }

    /**
     * UPDATE category
     */
    public function update(Request $request, $id)
    {
        $category = TeacherCategory::find($id);

        if (!$category) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Teacher category not found',
            ], 404);
        }

        // Validation
        $validated = $request->validate([
            'categories_id' => 'nullable|string|max:10',
            'name'          => 'required|string|max:255',
            'active_status' => 'required|boolean',
        ]);

        // Update
        $category->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Teacher category updated successfully',
            'data'    => $category,
        ]);
    }
}
