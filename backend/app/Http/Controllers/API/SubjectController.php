<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SubjectList;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    public function index(): JsonResponse
    {
        $subjects = SubjectList::query()
            ->where('active_status', true)
            ->orderBy('name_en')
            ->get()
            ->map(fn (SubjectList $subject) => [
                'id' => $subject->id,
                'name' => $subject->name_en,
            ]);

        return response()->json($subjects);
    }
}
