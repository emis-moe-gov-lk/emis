<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Interval;
use App\Models\Teacher;
use App\Models\TeacherTimetableConfig;
use App\Services\PeriodCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class IntervalController extends Controller
{
    public function __construct(private PeriodCalculationService $periodService) {}

    public function index(): JsonResponse
    {
        $config = $this->resolveConfig();

        return response()->json($this->formatIntervals($config));
    }

    public function update(Request $request, Interval $interval): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($interval->teacher_id === $config->id, 404);

        $request->validate([
            'startTime' => ['required', 'date_format:H:i'],
            'endTime' => ['required', 'date_format:H:i', 'after:startTime'],
        ]);

        return DB::transaction(function () use ($request, $config, $interval) {
            $interval->update([
                'start_time' => $request->startTime,
                'end_time' => $request->endTime,
            ]);

            return $this->recalculateAndRespond($config);
        });
    }

    /**
     * Recalculate all periods based on current intervals and return both.
     * Updates existing period records in-place to preserve IDs (and slot foreign keys).
     */
    private function recalculateAndRespond(TeacherTimetableConfig $config): JsonResponse
    {
        $intervalInputs = $config->intervals()
            ->orderBy('start_time')
            ->get()
            ->map(fn ($iv) => [
                'start_time' => $iv->start_time->format('H:i'),
                'end_time' => $iv->end_time->format('H:i'),
            ])
            ->toArray();

        $newTimes = $this->periodService->calculate(
            $config->day_start_time->format('H:i'),
            $config->day_end_time->format('H:i'),
            $config->num_periods,
            $intervalInputs
        );

        // Update existing periods in-place so IDs (and slot references) are preserved
        $existingPeriods = $config->periods()->orderBy('start_time')->get();

        foreach ($existingPeriods as $index => $period) {
            if (isset($newTimes[$index])) {
                $period->update([
                    'start_time' => $newTimes[$index]['start_time'],
                    'end_time' => $newTimes[$index]['end_time'],
                ]);
            }
        }

        return response()->json([
            'periods' => $config->periods()->orderBy('start_time')->get()->map(fn ($p) => [
                'id' => $p->id,
                'startTime' => $p->start_time->format('H:i'),
                'endTime' => $p->end_time->format('H:i'),
            ]),
            'intervals' => $this->formatIntervals($config),
        ]);
    }

    private function formatIntervals(TeacherTimetableConfig $config): array
    {
        return $config->intervals()
            ->orderBy('start_time')
            ->get()
            ->map(fn ($interval) => [
                'id' => $interval->id,
                'startTime' => $interval->start_time->format('H:i'),
                'endTime' => $interval->end_time->format('H:i'),
            ])
            ->toArray();
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user()->teacher;

        return $teacher?->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
