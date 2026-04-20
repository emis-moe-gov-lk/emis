<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHolidayRequest;
use App\Models\Teacher;
use App\Models\TeacherHoliday;
use App\Models\TeacherTimetableConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HolidayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $config = $this->resolveConfig();

        $query = $config->holidays()->orderBy('date');

        if ($request->has('start') && $request->has('end')) {
            $query->whereBetween('date', [$request->start, $request->end]);
        }

        return response()->json(
            $query->get()->map(fn (TeacherHoliday $h) => [
                'id' => $h->id,
                'date' => $h->date->format('Y-m-d'),
                'reason' => $h->reason,
            ])
        );
    }

    public function store(StoreHolidayRequest $request): JsonResponse
    {
        $config = $this->resolveConfig();

        $holiday = $config->holidays()->updateOrCreate(
            ['date' => $request->date],
            ['reason' => $request->reason]
        );

        $dayName = $holiday->date->format('l');
        $conflictingSlots = $config->slots()
            ->where('day', $dayName)
            ->count();

        return response()->json([
            'id' => $holiday->id,
            'date' => $holiday->date->format('Y-m-d'),
            'reason' => $holiday->reason,
            'conflictingSlots' => $conflictingSlots,
        ], 201);
    }

    public function destroy(TeacherHoliday $holiday): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($holiday->teacher_id === $config->id, 404);

        $holiday->delete();

        return response()->json(null, 204);
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user();

        return $teacher->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
