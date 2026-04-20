<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EducationalQualificationGrade;

class EducationalQualificationGradeSeeder extends Seeder
{
    public function run(): void
    {
        $grades = [
            ['grade_id' => 'GRD001', 'grade' => '1st Class'],
            ['grade_id' => 'GRD002', 'grade' => '2nd Upper Class'],
            ['grade_id' => 'GRD003', 'grade' => '2nd Lower Class'],
            ['grade_id' => 'GRD004', 'grade' => 'General Pass'],
            ['grade_id' => 'GRD005', 'grade' => 'None'],
        ];

        foreach ($grades as $grade) {
            EducationalQualificationGrade::updateOrCreate(
                ['grade_id' => $grade['grade_id']], // Match condition
                $grade                               // Insert or update data
            );
        }
    }
}
