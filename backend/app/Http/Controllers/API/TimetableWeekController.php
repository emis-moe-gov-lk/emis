<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Slot;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TimetableWeekController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate(['week_start' => ['required', 'date_format:Y-m-d']]);

        $teacher = Auth::user()->teacher;
        $config = $teacher?->timetableConfig;

        if (! $config) {
            return response()->json(['message' => 'Timetable not configured.'], 404);
        }

        $start = Carbon::parse($request->query('week_start'))->startOfDay();
        $end = $start->copy()->addDays(6)->endOfDay();

        // Slots
        $slots = $config->slots()
            ->where(fn ($q) => $q
                ->whereNull('date')
                ->orWhereBetween('date', [$start->toDateString(), $end->toDateString()])
            )
            ->with(['period', 'subject', 'comments' => fn ($q) => $q->whereBetween('date', [$start, $end])])
            ->get();

        // Attach upcoming comments for slots with no comments in this week
        $emptySlotIds = $slots->filter(fn ($s) => $s->comments->isEmpty())->pluck('id');

        if ($emptySlotIds->isNotEmpty()) {
            $minDates = Comment::selectRaw('slot_id, MIN(date) as next_date')
                ->whereIn('slot_id', $emptySlotIds)
                ->where('date', '>', $end)
                ->groupBy('slot_id')
                ->pluck('next_date', 'slot_id');

            if ($minDates->isNotEmpty()) {
                $upcomingComments = Comment::where(function ($q) use ($minDates) {
                    foreach ($minDates as $slotId => $date) {
                        $q->orWhere(fn ($sub) => $sub->where('slot_id', $slotId)->where('date', $date));
                    }
                })->get()->groupBy('slot_id');

                foreach ($slots as $slot) {
                    if ($slot->comments->isEmpty() && $upcomingComments->has($slot->id)) {
                        $upcoming = $upcomingComments[$slot->id];
                        $upcoming->each(fn ($c) => $c->is_upcoming = true);
                        $slot->setRelation('comments', $upcoming);
                    }
                }
            }
        }

        // Holidays
        $holidays = $config->holidays()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date')
            ->get()
            ->map(fn ($h) => [
                'id'     => $h->id,
                'date'   => $h->date->format('Y-m-d'),
                'reason' => $h->reason,
            ]);

        // Recorded dates grouped by slot
        $records = $config->lessonRecords()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->select('slot_id', 'date')
            ->get();

        $recordedDates = [];
        foreach ($records as $record) {
            $recordedDates[$record->slot_id][] = $record->date->format('Y-m-d');
        }

        return response()->json([
            'slots'         => $slots->map(fn (Slot $slot) => $this->formatSlot($slot)),
            'holidays'      => $holidays,
            'recordedDates' => $recordedDates,
        ]);
    }

    private function formatSlot(Slot $slot): array
    {
        return [
            'id'       => $slot->id,
            'day'      => $slot->day,
            'periodId' => $slot->period_id,
            'subject'  => $slot->subject->name_en,
            'class'    => $slot->class_name,
            'students' => $slot->students,
            'purpose'  => $slot->purpose,
            'date'     => $slot->date?->format('Y-m-d'),
            'comments' => $slot->comments->map(fn ($c) => [
                'id'         => $c->id,
                'text'       => $c->text,
                'date'       => $c->date->format('Y-m-d'),
                'isUpcoming' => (bool) ($c->is_upcoming ?? false),
            ]),
        ];
    }
}
