<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimetableSetupRequest;
use App\Models\Teacher;
use App\Models\TeacherTimetableConfig;
use App\Services\PeriodCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TimetableSetupController extends Controller
{
    public function __construct(private PeriodCalculationService $periodService) {}

    public function show(): JsonResponse
    {
        $teacher = Auth::user()->teacher;
        $config = $teacher?->timetableConfig;

        if (! $config) {
            return response()->json(['message' => 'Timetable not configured.'], 404);
        }

        $config->load([
            'periods' => fn ($q) => $q->orderBy('start_time'),
            'intervals' => fn ($q) => $q->orderBy('start_time'),
        ]);

        return response()->json($this->formatConfig($config));
    }

    public function store(StoreTimetableSetupRequest $request): JsonResponse
    {
        $teacher = Auth::user()->teacher
            ?? abort(response()->json(['message' => 'Teacher profile not found.'], 404));

        return DB::transaction(function () use ($request, $teacher) {
            $config = TeacherTimetableConfig::updateOrCreate(
                ['teacher_id' => $teacher->id],
                [
                    'day_start_time' => $request->dayStartTime,
                    'day_end_time'   => $request->dayEndTime,
                    'num_periods'    => $request->numPeriods,
                    'off_days'       => $request->offDays ?? [],
                ]
            );

            // Replace intervals
            $config->intervals()->delete();

            $intervalInputs = [];
            foreach ($request->intervals ?? [] as $interval) {
                $config->intervals()->create([
                    'start_time' => $interval['startTime'],
                    'end_time'   => $interval['endTime'],
                ]);
                $intervalInputs[] = [
                    'start_time' => $interval['startTime'],
                    'end_time'   => $interval['endTime'],
                ];
            }

            // Calculate new period times
            $periodTimes = $this->periodService->calculate(
                $request->dayStartTime,
                $request->dayEndTime,
                $request->numPeriods,
                $intervalInputs
            );

            // Update periods in-place to preserve IDs (and therefore slot references).
            // Only delete periods that no longer exist if numPeriods was reduced.
            $existingPeriods = $config->periods()->orderBy('start_time')->get();
            $newCount = count($periodTimes);
            $existingCount = $existingPeriods->count();

            foreach ($existingPeriods->take($newCount)->values() as $index => $period) {
                $period->update([
                    'start_time' => $periodTimes[$index]['start_time'],
                    'end_time'   => $periodTimes[$index]['end_time'],
                ]);
            }

            // Remove excess periods if numPeriods decreased (cascade deletes their slots)
            if ($existingCount > $newCount) {
                $existingPeriods->slice($newCount)->each->delete();
            }

            // Create new periods if numPeriods increased
            for ($i = $existingCount; $i < $newCount; $i++) {
                $config->periods()->create([
                    'start_time' => $periodTimes[$i]['start_time'],
                    'end_time'   => $periodTimes[$i]['end_time'],
                ]);
            }

            $config->load([
                'periods' => fn ($q) => $q->orderBy('start_time'),
                'intervals' => fn ($q) => $q->orderBy('start_time'),
            ]);

            return response()->json($this->formatConfig($config), 201);
        });
    }

    private function formatConfig(TeacherTimetableConfig $config): array
    {
        return [
            'dayStartTime' => $config->day_start_time->format('H:i'),
            'dayEndTime'   => $config->day_end_time->format('H:i'),
            'numPeriods'   => $config->num_periods,
            'offDays'      => $config->off_days ?? [],
            'periods'      => $config->periods->map(fn ($p) => [
                'id'        => $p->id,
                'startTime' => $p->start_time->format('H:i'),
                'endTime'   => $p->end_time->format('H:i'),
            ]),
            'intervals'    => $config->intervals->map(fn ($iv) => [
                'id'        => $iv->id,
                'startTime' => $iv->start_time->format('H:i'),
                'endTime'   => $iv->end_time->format('H:i'),
            ]),
        ];
    }
}
