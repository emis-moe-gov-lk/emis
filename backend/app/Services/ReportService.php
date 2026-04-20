<?php

namespace App\Services;

use App\Models\TeacherTimetableConfig;
use Carbon\Carbon;

class ReportService
{
    public function generate(TeacherTimetableConfig $config, Carbon $start, Carbon $end): array
    {
        // Regular slots (recurring, no date) + special slots within the date range
        $slots = $config->slots()
            ->where(fn ($q) => $q->whereNull('date')->orWhereBetween('date', [$start->toDateString(), $end->toDateString()]))
            ->with([
                'period',
                'subject',
                'comments' => fn ($q) => $q->whereBetween('date', [$start->toDateString(), $end->toDateString()])->orderBy('date'),
            ])
            ->get();

        $regular = $slots->filter(fn ($s) => $s->date === null);
        $special = $slots->filter(fn ($s) => $s->date !== null);

        $mapRegular = function ($slot) use ($start, $end) {
            $occ = $this->countWeekdayOccurrences($slot->day, $start, $end);

            return [
                'id' => $slot->id,
                'day' => $slot->day,
                'periodId' => $slot->period_id,
                'periodTime' => $slot->period->start_time->format('H:i').' - '.$slot->period->end_time->format('H:i'),
                'subject' => $slot->subject->name,
                'class' => $slot->class_name,
                'students' => $slot->students,
                'occurrences' => $occ,
                'comments' => $slot->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'text' => $c->text,
                    'date' => $c->date->format('Y-m-d'),
                ])->values()->all(),
            ];
        };

        $mapSpecial = function ($slot) {
            return [
                'id' => $slot->id,
                'day' => $slot->day,
                'date' => $slot->date->format('Y-m-d'),
                'periodId' => $slot->period_id,
                'periodTime' => $slot->period->start_time->format('H:i').' - '.$slot->period->end_time->format('H:i'),
                'subject' => $slot->subject->name,
                'class' => $slot->class_name,
                'students' => $slot->students,
                'purpose' => $slot->purpose,
                'comments' => $slot->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'text' => $c->text,
                    'date' => $c->date->format('Y-m-d'),
                ])->values()->all(),
            ];
        };

        $regularData = $regular->map($mapRegular)->values()->all();
        $specialData = $special->map($mapSpecial)->sortBy('date')->values()->all();

        $totalDays = $start->diffInDays($end) + 1;
        $regularOccurrences = array_sum(array_column($regularData, 'occurrences'));

        return [
            'period' => [
                'startDate' => $start->toDateString(),
                'endDate' => $end->toDateString(),
                'totalDays' => $totalDays,
            ],
            'summary' => [
                'totalOccurrences' => $regularOccurrences,
                'uniqueSubjects' => $regular->pluck('subject.name')->unique()->count(),
                'uniqueClasses' => $regular->pluck('class_name')->unique()->count(),
                'totalComments' => $slots->sum(fn ($s) => $s->comments->count()),
                'regularCount' => $regular->count(),
                'specialCount' => $special->count(),
            ],
            'regular' => [
                'slots' => $regularData,
                'bySubject' => $this->aggregateByKey($regularData, 'subject'),
            ],
            'special' => [
                'slots' => $specialData,
            ],
        ];
    }

    private function countWeekdayOccurrences(string $dayName, Carbon $start, Carbon $end): int
    {
        $dayMap = [
            'Sunday' => Carbon::SUNDAY,
            'Monday' => Carbon::MONDAY,
            'Tuesday' => Carbon::TUESDAY,
            'Wednesday' => Carbon::WEDNESDAY,
            'Thursday' => Carbon::THURSDAY,
            'Friday' => Carbon::FRIDAY,
            'Saturday' => Carbon::SATURDAY,
        ];

        $targetDow = $dayMap[$dayName];
        $totalDays = $start->diffInDays($end) + 1;
        $fullWeeks = intdiv($totalDays, 7);
        $remainder = $totalDays % 7;

        $count = $fullWeeks;
        for ($i = 0; $i < $remainder; $i++) {
            if ($start->copy()->addDays($fullWeeks * 7 + $i)->dayOfWeek === $targetDow) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * @param  array<int, array<string, mixed>>  $slots
     * @return array<string, array{count: int, occurrences: int}>
     */
    private function aggregateByKey(array $slots, string $key): array
    {
        $result = [];
        foreach ($slots as $slot) {
            $k = $slot[$key] ?? 'Unknown';
            if (! isset($result[$k])) {
                $result[$k] = ['count' => 0, 'occurrences' => 0];
            }
            $result[$k]['count']++;
            $result[$k]['occurrences'] += $slot['occurrences'];
        }

        return $result;
    }
}
