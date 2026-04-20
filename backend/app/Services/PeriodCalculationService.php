<?php

namespace App\Services;

class PeriodCalculationService
{
    /**
     * Calculate period start/end times for a teacher's day.
     *
     * @param  string  $dayStart  "HH:MM" format
     * @param  string  $dayEnd  "HH:MM" format
     * @param  array<int, array{start_time: string, end_time: string}>  $intervals  sorted by start_time
     * @return array<int, array{start_time: string, end_time: string}>
     */
    public function calculate(string $dayStart, string $dayEnd, int $numPeriods, array $intervals): array
    {
        $dayStartMinutes = $this->toMinutes($dayStart);
        $dayEndMinutes = $this->toMinutes($dayEnd);

        $totalDay = $dayEndMinutes - $dayStartMinutes;

        // Sort intervals by start_time
        usort($intervals, fn ($a, $b) => $this->toMinutes($a['start_time']) <=> $this->toMinutes($b['start_time']));

        $totalIntervalTime = 0;
        foreach ($intervals as $interval) {
            $totalIntervalTime += $this->toMinutes($interval['end_time']) - $this->toMinutes($interval['start_time']);
        }

        $teachingTime = $totalDay - $totalIntervalTime;
        $baseDuration = intdiv($teachingTime, $numPeriods);
        $remainder = $teachingTime % $numPeriods;

        // Build period durations: first $remainder periods get +1 minute
        $durations = [];
        for ($i = 0; $i < $numPeriods; $i++) {
            $durations[] = $baseDuration + ($i < $remainder ? 1 : 0);
        }

        // Generate periods sequentially, inserting intervals at their exact clock times
        $periods = [];
        $cursor = $dayStartMinutes;
        $periodIndex = 0;

        while ($periodIndex < $numPeriods) {
            // Check if an interval starts at the cursor position
            $insertedInterval = false;
            foreach ($intervals as $key => $interval) {
                $intervalStart = $this->toMinutes($interval['start_time']);
                if ($intervalStart === $cursor) {
                    $cursor = $this->toMinutes($interval['end_time']);
                    unset($intervals[$key]);
                    $intervals = array_values($intervals);
                    $insertedInterval = true;

                    break;
                }
            }

            if ($insertedInterval) {
                continue;
            }

            // Check if an interval starts before the end of this period
            $duration = $durations[$periodIndex];
            $periodEnd = $cursor + $duration;

            $nextIntervalStart = null;
            foreach ($intervals as $interval) {
                $iStart = $this->toMinutes($interval['start_time']);
                if ($iStart > $cursor && $iStart < $periodEnd) {
                    $nextIntervalStart = $iStart;

                    break;
                }
            }

            if ($nextIntervalStart !== null) {
                // Period ends at interval start
                $periods[] = [
                    'start_time' => $this->fromMinutes($cursor),
                    'end_time' => $this->fromMinutes($nextIntervalStart),
                ];
                // Remaining duration carries over
                $usedDuration = $nextIntervalStart - $cursor;
                $durations[$periodIndex] -= $usedDuration;
                $cursor = $nextIntervalStart;
                $periodIndex++;
            } else {
                $periods[] = [
                    'start_time' => $this->fromMinutes($cursor),
                    'end_time' => $this->fromMinutes($periodEnd),
                ];
                $cursor = $periodEnd;
                $periodIndex++;
            }
        }

        return $periods;
    }

    private function toMinutes(string $time): int
    {
        [$h, $m] = explode(':', $time);

        return (int) $h * 60 + (int) $m;
    }

    private function fromMinutes(int $minutes): string
    {
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;

        return sprintf('%02d:%02d', $h, $m);
    }
}
