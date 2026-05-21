<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Title;
use Illuminate\Http\Request;

class TitleController extends Controller
{
    /**
     * GET all titles
     */
    public function index(Request $request)
    {
        // Optional ?active=1
        $active = $request->query('active');

        $query = Title::query();

        if ($active == "1") {
            $query->active();
        }

        $titles = $query->orderBy('title_name')->get();

        return response()->json([
            'status' => 'success',
            'count'  => $titles->count(),
            'data'   => $titles,
        ], 200);
    }

    /**
     * GET single title by ID
     */
    public function show($id)
    {
        $title = Title::find($id);

        if (!$title) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Title not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $title,
        ], 200);
    }

    /**
     * UPDATE title
     */
    public function update(Request $request, $id)
    {
        $title = Title::find($id);

        if (!$title) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Title not found',
            ], 404);
        }

        // Validate
        $validated = $request->validate([
            'title_id'     => 'nullable|string|max:10',
            'title_name'   => 'required|string|max:50',
            'active_status'=> 'required|boolean',
        ]);

        // Update
        $title->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Title updated successfully',
            'data'    => $title,
        ], 200);
    }
}
