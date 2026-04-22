<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectColorRequest;
use App\Models\SubjectColor;
use App\Models\SubjectList;
use App\Models\Teacher;
use App\Models\TeacherTimetableConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SubjectColorController extends Controller
{
    public function index(): JsonResponse
    {
        $config = $this->resolveConfig();

        $colors = $config->subjectColors()
            ->with('subject')
            ->get()
            ->map(fn (SubjectColor $color) => [
                'id' => $color->id,
                'subjectId' => $color->subject_id,
                'subject' => $color->subject->name_en,
                'color' => $color->color,
            ]);

        return response()->json($colors);
    }

    public function store(StoreSubjectColorRequest $request): JsonResponse
    {
        $config = $this->resolveConfig();

        $subjectId = $request->subject_id;

        if (! $subjectId && $request->subject) {
            $subject = SubjectList::where('name_en', $request->subject)->first();
            $subjectId = $subject->id;
        }

        $color = SubjectColor::updateOrCreate(
            ['teacher_id' => $config->id, 'subject_id' => $subjectId],
            ['color' => $request->color]
        );

        $color->load('subject');

        return response()->json([
            'id' => $color->id,
            'subjectId' => $color->subject_id,
            'subject' => $color->subject->name_en,
            'color' => $color->color,
        ], 201);
    }

    public function destroy(SubjectColor $subjectColor): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($subjectColor->teacher_id === $config->id, 404);

        $subjectColor->delete();

        return response()->json(null, 204);
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user();

        return $teacher->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
