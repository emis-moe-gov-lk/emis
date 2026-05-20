<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SubjectList;
use Illuminate\Http\Request;

class SubjectListController extends Controller
{
    /**
     * GET all subjects
     */
    public function index(Request $request)
    {
        $active = $request->query('active'); // optional filter ?active=1
        $lang   = $request->query('lang', 'en'); // optional ?lang=en/si/ta

        $query = SubjectList::query();

        if ($active == "1") {
            $query->active();
        }

        $subjects = $query->orderBy('name_en')->get();

        // Language-specific response
        $data = $subjects->map(function ($item) use ($lang) {
            $nameKey = "name_{$lang}";
            return [
                'id'          => $item->id,
                'subject_id'  => $item->subject_id,
                'subject_code'=> $item->subject_code,
                'name'        => $item->$nameKey ?? $item->name_en,
                'active_status' => $item->active_status,
            ];
        });

        return response()->json([
            'status' => 'success',
            'count'  => $data->count(),
            'data'   => $data,
        ], 200);
    }

    /**
     * GET one subject
     */
    public function show($id)
    {
        $subject = SubjectList::find($id);

        if (!$subject) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Subject not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $subject,
        ], 200);
    }

    /**
     * UPDATE subject
     */
    public function update(Request $request, $id)
    {
        $subject = SubjectList::find($id);

        if (!$subject) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Subject not found',
            ], 404);
        }

        // Validation
        $validated = $request->validate([
            'subject_id'   => 'nullable|string|max:10',
            'subject_code' => 'nullable|string|max:10',
            'name_en'      => 'required|string|max:255',
            'name_si'      => 'nullable|string|max:255',
            'name_ta'      => 'nullable|string|max:255',
            'active_status'=> 'required|boolean',
        ]);

        $subject->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Subject updated successfully',
            'data'    => $subject,
        ], 200);
    }
}
