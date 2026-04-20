<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\VersionResource;
use App\Models\Version;
use Illuminate\Http\Request;

class VersionController extends Controller
{

    public function index()
    {
        $versions = Version::latest()->get();

        return response()->json(
            $versions,
            201
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'version' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'changes' => 'required|array',
            'changes.*' => 'string|max:255',
        ]);

        $validated['changes'] = implode("\n", $validated['changes']);

        $version = Version::create($validated);

        return response()->json(
            $version,
            201
        );
    }

        public function update(Request $request, $id)
{
    $version = Version::find($id);

    if (!$version) {
        return response()->json([
            'message' => 'Version not found'
        ], 404);
    }

   $validated = $request->validate([
    'version' => 'required|string|max:20',
    'title' => 'required|string|max:255',
    'description' => 'nullable|string',
    'changes' => 'required|array',
    'changes.*' => 'string|max:255',
]);

        $validated['changes'] = implode("\n", $validated['changes']);

    $version->update($validated);

    return response()->json([
       'message' => 'Version updated successfully'
    ],200);

}

public function destroy($id)
{
    $version = Version::find($id);

    if (!$version) {
        return response()->json([
            'message' => 'Version not found'
        ], 404);
    }

    $version->delete();

    return response()->json([
        'message' => 'Version deleted successfully'
    ], 200);
}
}
