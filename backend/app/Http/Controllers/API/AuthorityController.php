<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Authority;
use Illuminate\Http\Request;

class AuthorityController extends Controller
{
    /**
     * GET all authorities
     */
    public function index(Request $request)
    {
        // Optional ?active=1
        $active = $request->query('active');

        $query = Authority::query();

        if ($active == "1") {
            $query->active();
        }

        $data = $query->orderBy('authority_name')->get();

        return response()->json([
            'status' => 'success',
            'count'  => $data->count(),
            'data'   => $data,
        ], 200);
    }

    /**
     * UPDATE authority
     */
    public function update(Request $request, $id)
    {
        $authority = Authority::find($id);

        if (!$authority) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Authority not found',
            ], 404);
        }

        $validated = $request->validate([
            'authority_id'    => 'nullable|string|max:20',
            'authority_name'  => 'required|string|max:255',
            'description'     => 'nullable|string',
            'active_status'   => 'required|boolean',
        ]);

        $authority->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Authority updated successfully',
            'data'    => $authority,
        ], 200);
    }
}
