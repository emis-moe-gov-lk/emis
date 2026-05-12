<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SubjectList;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TimetableInitController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $teacher = Auth::user()->teacher;
        $config = $teacher?->timetableConfig;

        if (! $config) {
            return response()->json(['message' => 'Timetable not configured.'], 404);
        }

        $config->load([
            'periods'       => fn ($q) => $q->orderBy('start_time'),
            'intervals'     => fn ($q) => $q->orderBy('start_time'),
            'subjectColors' => fn ($q) => $q->with('subject'),
        ]);

        $subjects = SubjectList::where('active_status', true)
            ->orderBy('name_en')
            ->get()
            ->map(fn (SubjectList $s) => ['id' => $s->id, 'name' => $s->name_en]);

        return response()->json([
            'offDays'       => $config->off_days ?? [],
            'numPeriods'    => $config->num_periods,
            'dayStartTime'  => $config->day_start_time->format('H:i'),
            'dayEndTime'    => $config->day_end_time->format('H:i'),
            'periods'       => $config->periods->map(fn ($p) => [
                'id'        => $p->id,
                'startTime' => $p->start_time->format('H:i'),
                'endTime'   => $p->end_time->format('H:i'),
            ]),
            'intervals'     => $config->intervals->map(fn ($iv) => [
                'id'        => $iv->id,
                'startTime' => $iv->start_time->format('H:i'),
                'endTime'   => $iv->end_time->format('H:i'),
            ]),
            'subjectColors' => $config->subjectColors->map(fn ($c) => [
                'id'      => $c->id,
                'subject' => $c->subject->name_en,
                'color'   => $c->color,
            ]),
            'subjects'      => $subjects,
        ]);
    }
}
