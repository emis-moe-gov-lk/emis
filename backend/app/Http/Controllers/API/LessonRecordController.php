<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLessonRecordRequest;
use App\Http\Requests\UpdateLessonRecordRequest;
use App\Models\LessonRecord;
use App\Models\Slot;
use App\Models\Teacher;
use App\Models\TeacherTimetableConfig;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LessonRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $config = $this->resolveConfig();

        $query = $config->lessonRecords()
            ->with(['slot.subject', 'slot.period', 'outcomes']);

        if ($request->query('start_date') && $request->query('end_date')) {
            $query->whereBetween('date', [
                $request->query('start_date'),
                $request->query('end_date'),
            ]);
        }

        if ($request->query('class')) {
            $query->whereHas('slot', fn ($q) => $q->where('class_name', $request->query('class')));
        }

        if ($request->query('subject')) {
            $query->whereHas('slot', fn ($q) => $q->whereHas('subject', fn ($sq) => $sq->where('name', $request->query('subject'))));
        }

        $records = $query->orderByDesc('date')->get();

        return response()->json($records->map(fn (LessonRecord $r) => $this->formatRecord($r)));
    }

    public function bySlot(Slot $slot, Request $request): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($slot->teacher_id === $config->id, 404);

        $query = $slot->lessonRecords()->with('outcomes');

        if ($request->query('date')) {
            $query->where('date', $request->query('date'));
        }

        return response()->json(
            $query->orderByDesc('date')
                ->get()
                ->map(fn (LessonRecord $r) => $this->formatRecord($r->loadMissing(['slot.subject', 'slot.period'])))
        );
    }

    public function store(StoreLessonRecordRequest $request): JsonResponse
    {
        $config = $this->resolveConfig();

        return DB::transaction(function () use ($request, $config) {
            $record = $config->lessonRecords()->create([
                'slot_id' => $request->slotId,
                'date' => $request->date,
                'topic' => $request->topic,
                'description' => $request->description,
            ]);

            if ($request->has('outcomes')) {
                foreach ($request->outcomes as $i => $outcome) {
                    $record->outcomes()->create([
                        'description' => $outcome['description'],
                        'sort_order' => $outcome['sortOrder'] ?? $i,
                    ]);
                }
            }

            $record->load(['slot.subject', 'slot.period', 'outcomes']);

            return response()->json($this->formatRecord($record), 201);
        });
    }

    public function update(UpdateLessonRecordRequest $request, LessonRecord $lessonRecord): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($lessonRecord->teacher_id === $config->id, 404);

        return DB::transaction(function () use ($request, $lessonRecord) {
            if ($request->has('topic')) {
                $lessonRecord->topic = $request->topic;
            }

            if ($request->has('description')) {
                $lessonRecord->description = $request->description;
            }

            $lessonRecord->save();

            if ($request->has('outcomes')) {
                $lessonRecord->outcomes()->delete();

                foreach ($request->outcomes as $i => $outcome) {
                    $lessonRecord->outcomes()->create([
                        'description' => $outcome['description'],
                        'sort_order' => $outcome['sortOrder'] ?? $i,
                    ]);
                }
            }

            $lessonRecord->load(['slot.subject', 'slot.period', 'outcomes']);

            return response()->json($this->formatRecord($lessonRecord));
        });
    }

    public function destroy(LessonRecord $lessonRecord): JsonResponse
    {
        $config = $this->resolveConfig();

        abort_unless($lessonRecord->teacher_id === $config->id, 404);

        $lessonRecord->delete();

        return response()->json(null, 204);
    }

    public function recordedDates(Request $request): JsonResponse
    {
        $config = $this->resolveConfig();

        $request->validate(['week_start' => ['required', 'date_format:Y-m-d']]);

        $start = Carbon::parse($request->query('week_start'))->startOfDay();
        $end = $start->copy()->addDays(6)->endOfDay();

        $records = $config->lessonRecords()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->select('slot_id', 'date')
            ->get();

        $grouped = [];

        foreach ($records as $record) {
            $grouped[$record->slot_id][] = $record->date->format('Y-m-d');
        }

        return response()->json($grouped);
    }

    private function formatRecord(LessonRecord $record): array
    {
        return [
            'id' => $record->id,
            'slotId' => $record->slot_id,
            'date' => $record->date->format('Y-m-d'),
            'topic' => $record->topic,
            'description' => $record->description,
            'subject' => $record->slot->subject->name ?? null,
            'class' => $record->slot->class_name ?? null,
            'periodTime' => $record->slot->period
                ? $record->slot->period->start_time->format('H:i').' - '.$record->slot->period->end_time->format('H:i')
                : null,
            'day' => $record->slot->day ?? null,
            'outcomes' => $record->outcomes->map(fn ($o) => [
                'id' => $o->id,
                'description' => $o->description,
                'sortOrder' => $o->sort_order,
            ])->values()->all(),
            'createdAt' => $record->created_at->toIso8601String(),
        ];
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user()->teacher;

        return $teacher?->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
