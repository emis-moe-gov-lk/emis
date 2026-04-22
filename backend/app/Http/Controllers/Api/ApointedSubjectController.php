<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ApointedSubject;

class ApointedSubjectController extends Controller
{
    public function index()
    {
        $lang = request('lang', 'en'); // default = en

        $subjects = ApointedSubject::active()->get();

        $data = $subjects->map(function ($item) use ($lang) {
            return [
                'id' => $item->id,
                'a_subject_id' => $item->a_subject_id,
                'name' => $item->{"name_{$lang}"} ?? $item->name_en,
            ];
        });

        return response()->json([
            'status' => 'success',
            'count' => $data->count(),
            'data' => $data,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming data
        $validated = $request->validate([
            'name_en'       => 'required|string|max:255',
            'name_si'       => 'nullable|string|max:255',
            'name_ta'       => 'nullable|string|max:255',
            'active_status' => 'required|boolean',
        ]);

        // Find the subject
        $subject = ApointedSubject::find($id);

        if (!$subject) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Subject not found.',
            ], 404);
        }

        // Update values
        $subject->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Subject updated successfully.',
            'data'    => $subject,
        ], 200);
    }


}
