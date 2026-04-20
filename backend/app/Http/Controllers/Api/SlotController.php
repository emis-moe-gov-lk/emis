<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSlotRequest;
use App\Http\Requests\UpdateSlotRequest;
use App\Models\Comment;
use App\Models\Slot;
use App\Models\SubjectList;
use App\Models\Teacher;
use App\Models\TeacherTimetableConfig;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SlotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $config = $this->resolveConfig();

        $monthStart = $request->query('month_start');

        if ($monthStart) {
            $start = Carbon::parse($monthStart.'-01')->startOfMonth()->startOfDay();
            $end = $start->copy()->endOfMonth()->endOfDay();

            $slots = $config->slots()
                ->where(fn ($q) => $q
                    ->whereNull('date')
                    ->orWhereBetween('date', [$start->toDateString(), $end->toDateString()])
                )
                ->with(['period', 'subject', 'comments' => fn ($q) => $q->whereBetween('date', [$start, $end])])
                ->get();

            return response()->json($slots->map(fn (Slot $slot) => $this->formatSlot($slot)));
        }

        $weekStart = $request->query('week_start');

        if ($weekStart) {
            $start = Carbon::parse($weekStart)->startOfDay();
            $end = $start->copy()->addDays(6)->endOfDay();

            // Regular slots (no date) + special slots within this week
            $slots = $config->slots()
                ->where(fn ($q) => $q->whereNull('date')->orWhereBetween('date', [$start->toDateString(), $end->toDateString()]))
                ->with(['period', 'subject', 'comments' => fn ($q) => $q->whereBetween('date', [$start, $end])])
                ->get();

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

            return response()->json($slots->map(fn (Slot $slot) => $this->formatSlot($slot)));
        }

        $slots = $config->slots()
            ->with(['period', 'subject', 'comments'])
            ->get()
            ->map(fn (Slot $slot) => $this->formatSlot($slot));

        return response()->json($slots);
    }

    public function comments(Slot $slot): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($slot->teacher_id === $config->id, 404);

        return response()->json(
            $slot->comments()
                ->where('date', '>=', Carbon::today())
                ->orderBy('date')
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'text' => $c->text,
                    'date' => $c->date->format('Y-m-d'),
                ])
        );
    }

    public function store(StoreSlotRequest $request): JsonResponse
    {
        $config = $this->resolveConfig();

        return DB::transaction(function () use ($request, $config) {
            $subject = SubjectList::where('name_en', $request->subject)->firstOrFail();

            $slot = $config->slots()->create([
                'day' => $request->day,
                'period_id' => $request->periodId,
                'subject_id' => $subject->id,
                'class_name' => $request->class,
                'students' => $request->students,
                'purpose' => $request->purpose,
                'date' => $request->date,
            ]);

            if ($request->has('comments')) {
                foreach ($request->comments as $comment) {
                    $slot->comments()->create([
                        'text' => $comment['text'],
                        'date' => $comment['date'],
                    ]);
                }
            }

            $slot->load(['period', 'subject', 'comments']);

            return response()->json($this->formatSlot($slot), 201);
        });
    }

    public function update(UpdateSlotRequest $request, Slot $slot): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($slot->teacher_id === $config->id, 404);

        return DB::transaction(function () use ($request, $slot) {
            if ($request->has('subject')) {
                $subject = SubjectList::where('name_en', $request->subject)->firstOrFail();
                $slot->subject_id = $subject->id;
            }

            if ($request->has('class')) {
                $slot->class_name = $request->class;
            }

            if ($request->has('students')) {
                $slot->students = $request->students;
            }

            if ($request->has('purpose')) {
                $slot->purpose = $request->purpose;
            }

            $slot->save();

            if ($request->has('comments')) {
                $slot->comments()->delete();
                foreach ($request->comments as $comment) {
                    $slot->comments()->create([
                        'text' => $comment['text'],
                        'date' => $comment['date'],
                    ]);
                }
            }

            $slot->load(['period', 'subject', 'comments']);

            return response()->json($this->formatSlot($slot));
        });
    }

    public function destroy(Slot $slot): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($slot->teacher_id === $config->id, 404);

        $slot->delete();

        return response()->json(null, 204);
    }

    private function formatSlot(Slot $slot): array
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
            'comments' => $slot->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'text' => $comment->text,
                'date' => $comment->date->format('Y-m-d'),
                'isUpcoming' => (bool) ($comment->is_upcoming ?? false),
            ]),
        ];
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user();

        return $teacher->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
