<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TeacherTimetableConfig;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CurrentClassController extends Controller
{
    public function show(): JsonResponse
    {
        $config = $this->resolveConfig();

        $periods = $config->periods()->orderBy('start_time')->get()->values();

        if ($periods->isEmpty()) {
            return response()->json(null);
        }

        $now = Carbon::now();
        $today = $now->format('l');
        $todayDate = $now->toDateString();
        $nowMinutes = $now->hour * 60 + $now->minute;

        // Collect day names for the next 7 days (for regular slot matching)
        $relevantDays = collect(range(0, 7))
            ->map(fn ($d) => $now->copy()->addDays($d)->format('l'))
            ->unique()
            ->values()
            ->toArray();

        $endDate = $now->copy()->addDays(7)->toDateString();

        // One query: regular slots for relevant days + special slots within the next 7 days
        $slots = $config->slots()
            ->where(fn ($q) => $q
                ->where(fn ($q2) => $q2->whereNull('date')->whereIn('day', $relevantDays))
                ->orWhere(fn ($q2) => $q2->whereBetween('date', [$todayDate, $endDate]))
            )
            ->with([
                'subject',
                'comments' => fn ($q) => $q->where('date', '>=', $todayDate)->orderBy('date'),
            ])
            ->get();

        $timeToMinutes = fn (string $t): int => (int) explode(':', $t)[0] * 60 + (int) explode(':', $t)[1];

        // Special slot (exact date) takes priority over regular recurring slot
        $findSlot = fn (string $dayName, string $date, int $periodId) => $slots->first(
            fn ($s) => $s->date?->toDateString() === $date && $s->period_id === $periodId
        ) ?? $slots->first(
            fn ($s) => is_null($s->date) && $s->day === $dayName && $s->period_id === $periodId
        );

        // 1. Find which period is happening right now
        $currentPeriodIndex = -1;
        foreach ($periods as $i => $period) {
            $start = $timeToMinutes($period->start_time->format('H:i'));
            $end = $timeToMinutes($period->end_time->format('H:i'));
            if ($nowMinutes >= $start && $nowMinutes < $end) {
                $currentPeriodIndex = $i;
                break;
            }
        }

        // 2. Ongoing class
        if ($currentPeriodIndex !== -1) {
            $period = $periods[$currentPeriodIndex];
            $slot = $findSlot($today, $todayDate, $period->id);

            if ($slot) {
                $start = $timeToMinutes($period->start_time->format('H:i'));
                $end = $timeToMinutes($period->end_time->format('H:i'));
                $duration = $end - $start;
                $elapsed = $nowMinutes - $start;

                return response()->json([
                    'type' => 'ONGOING',
                    'slot' => $this->formatSlot($slot),
                    'period' => $this->formatPeriod($period),
                    'remainingMinutes' => $end - $nowMinutes,
                    'progressPercent' => (int) round(($elapsed / $duration) * 100),
                ]);
            }
        }

        // 3. Upcoming class later today
        $searchFrom = $currentPeriodIndex !== -1 ? $currentPeriodIndex + 1 : 0;
        for ($i = $searchFrom; $i < $periods->count(); $i++) {
            $period = $periods[$i];
            $start = $timeToMinutes($period->start_time->format('H:i'));
            $end = $timeToMinutes($period->end_time->format('H:i'));

            if ($nowMinutes >= $end) {
                continue;
            }
            if ($nowMinutes >= $start && $currentPeriodIndex === -1) {
                continue;
            }

            $slot = $findSlot($today, $todayDate, $period->id);
            if ($slot) {
                return response()->json([
                    'type' => 'UPCOMING',
                    'slot' => $this->formatSlot($slot),
                    'period' => $this->formatPeriod($period),
                    'remainingMinutes' => $start - $nowMinutes,
                    'progressPercent' => 0,
                ]);
            }
        }

        // 4. Next class within the following 7 days
        for ($d = 1; $d <= 7; $d++) {
            $nextDay = $now->copy()->addDays($d);
            $nextDayName = $nextDay->format('l');
            $nextDate = $nextDay->toDateString();

            foreach ($periods as $period) {
                $slot = $findSlot($nextDayName, $nextDate, $period->id);
                if ($slot) {
                    $dayStart = $timeToMinutes($period->start_time->format('H:i'));
                    $minutesUntilMidnight = 24 * 60 - $nowMinutes;

                    return response()->json([
                        'type' => 'UPCOMING',
                        'slot' => $this->formatSlot($slot),
                        'period' => $this->formatPeriod($period),
                        'remainingMinutes' => $minutesUntilMidnight + ($d - 1) * 24 * 60 + $dayStart,
                        'progressPercent' => 0,
                    ]);
                }
            }
        }

        return response()->json(null);
    }

    private function formatPeriod($period): array
    {
        return [
            'startTime' => $period->start_time->format('H:i'),
            'endTime' => $period->end_time->format('H:i'),
        ];
    }

    private function formatSlot($slot): array
    {
        return [
            'id' => $slot->id,
            'day' => $slot->day,
            'periodId' => $slot->period_id,
            'subject' => $slot->subject->name_en,
            'class' => $slot->class_name,
            'students' => $slot->students,
            'purpose' => $slot->purpose,
            'date' => $slot->date?->format('Y-m-d'),
            'comments' => $slot->comments->map(fn ($c) => [
                'id' => $c->id,
                'text' => $c->text,
                'date' => $c->date->format('Y-m-d'),
                'isUpcoming' => false,
            ])->toArray(),
        ];
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user();

        return $teacher->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
