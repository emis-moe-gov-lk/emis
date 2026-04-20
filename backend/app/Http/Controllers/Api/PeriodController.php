<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePeriodRequest;
use App\Models\Period;
use App\Models\Teacher;
use App\Models\TeacherTimetableConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PeriodController extends Controller
{
    public function index(): JsonResponse
    {
        $config = $this->resolveConfig();

        $periods = $config->periods()
            ->orderBy('start_time')
            ->get()
            ->map(fn (Period $period) => $this->formatPeriod($period));

        return response()->json($periods);
    }

    public function update(UpdatePeriodRequest $request, Period $period): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($period->teacher_id === $config->id, 404);

        return DB::transaction(function () use ($request, $config, $period) {
            $oldEndMinutes = $period->end_time->hour * 60 + $period->end_time->minute;

            $period->update([
                'start_time' => $request->startTime,
                'end_time' => $request->endTime,
            ]);

            $period->refresh();
            $newEndMinutes = $period->end_time->hour * 60 + $period->end_time->minute;
            $shift = $newEndMinutes - $oldEndMinutes;

            if ($shift !== 0) {
                $laterPeriods = $config->periods()
                    ->where('id', '!=', $period->id)
                    ->get()
                    ->filter(fn ($p) => ($p->start_time->hour * 60 + $p->start_time->minute) >= $oldEndMinutes);

                foreach ($laterPeriods as $p) {
                    $p->update([
                        'start_time' => $p->start_time->copy()->addMinutes($shift)->format('H:i'),
                        'end_time' => $p->end_time->copy()->addMinutes($shift)->format('H:i'),
                    ]);
                }
            }

            return response()->json(
                $config->periods()->orderBy('start_time')->get()->map(fn (Period $p) => $this->formatPeriod($p))
            );
        });
    }

    private function formatPeriod(Period $period): array
    {
        return [
            'id' => $period->id,
            'startTime' => $period->start_time->format('H:i'),
            'endTime' => $period->end_time->format('H:i'),
        ];
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user();

        return $teacher->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
