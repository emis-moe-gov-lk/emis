<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Models\Teacher;
use App\Services\PeriodCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function __construct(private PeriodCalculationService $periodService) {}

    public function index(): JsonResponse
    {
        $teachers = Teacher::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ]);

        return response()->json($teachers);
    }

    public function show(Teacher $teacher): JsonResponse
    {
        $teacher->load(['periods' => fn ($q) => $q->orderBy('start_time'), 'intervals' => fn ($q) => $q->orderBy('start_time')]);

        return response()->json($this->formatTeacher($teacher));
    }

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $teacher = Teacher::create([
                'name' => $request->name,
                'day_start_time' => $request->dayStartTime,
                'day_end_time' => $request->dayEndTime,
                'num_periods' => $request->numPeriods,
                'off_days' => $request->offDays ?? [],
            ]);

            // Create intervals
            $intervalInputs = [];
            if ($request->has('intervals')) {
                foreach ($request->intervals as $interval) {
                    $teacher->intervals()->create([
                        'start_time' => $interval['startTime'],
                        'end_time' => $interval['endTime'],
                    ]);
                    $intervalInputs[] = [
                        'start_time' => $interval['startTime'],
                        'end_time' => $interval['endTime'],
                    ];
                }
            }

            // Auto-calculate periods
            $periods = $this->periodService->calculate(
                $request->dayStartTime,
                $request->dayEndTime,
                $request->numPeriods,
                $intervalInputs
            );

            foreach ($periods as $period) {
                $teacher->periods()->create([
                    'start_time' => $period['start_time'],
                    'end_time' => $period['end_time'],
                ]);
            }

            $teacher->load(['periods' => fn ($q) => $q->orderBy('start_time'), 'intervals' => fn ($q) => $q->orderBy('start_time')]);

            return response()->json($this->formatTeacher($teacher), 201);
        });
    }

    private function formatTeacher(Teacher $teacher): array
    {
        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'dayStartTime' => $teacher->day_start_time->format('H:i'),
            'dayEndTime' => $teacher->day_end_time->format('H:i'),
            'numPeriods' => $teacher->num_periods,
            'offDays' => $teacher->off_days ?? [],
            'periods' => $teacher->periods->map(fn ($p) => [
                'id' => $p->id,
                'startTime' => $p->start_time->format('H:i'),
                'endTime' => $p->end_time->format('H:i'),
            ]),
            'intervals' => $teacher->intervals->map(fn ($i) => [
                'id' => $i->id,
                'startTime' => $i->start_time->format('H:i'),
                'endTime' => $i->end_time->format('H:i'),
            ]),
        ];
    }
}
