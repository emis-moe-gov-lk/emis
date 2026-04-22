<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GradeSpan;
use Carbon\Carbon;

class GradeSpanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $gradeSpans = [
            ['grade_span_id' => 'GSID01', 'grade_span_name' => 'Grade 1-5'],
            ['grade_span_id' => 'GSID02', 'grade_span_name' => 'Grade 1-9'],
            ['grade_span_id' => 'GSID03', 'grade_span_name' => 'Grade 1-11'],
            ['grade_span_id' => 'GSID04', 'grade_span_name' => 'Grade 1-13'],
            ['grade_span_id' => 'GSID05', 'grade_span_name' => 'Grade 6-11'],
            ['grade_span_id' => 'GSID06', 'grade_span_name' => 'Grade 6-13'],
        ];

        foreach ($gradeSpans as $span) {
            GradeSpan::updateOrCreate(
                ['grade_span_id' => $span['grade_span_id']], // Unique key
                array_merge($span, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }
}
