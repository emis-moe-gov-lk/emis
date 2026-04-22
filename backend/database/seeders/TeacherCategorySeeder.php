<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TeacherCategory;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TeacherCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    { 
        $now = Carbon::now()->format('Y-m-d H:i:s');
        $categories = [
            ['categories_id' => 'TCAT0001', 'name' => 'Graduate', 'description' => 'Graduate Teachers (All graduates including post-graduates)', 'created_at' => $now, 'updated_at' => $now],
            ['categories_id' => 'TCAT0002', 'name' => 'Trained', 'description' => 'Trained Teachers ( Including National Teaching Sciences Diploma / Science-Maths two year diploma/ Distant teacher training)', 'created_at' => $now, 'updated_at' => $now],
            ['categories_id' => 'TCAT0003', 'name' => 'Other Diplomas', 'description' => 'Teachers who are not trained and others with two year/three year diplomas', 'created_at' => $now, 'updated_at' => $now],
            ['categories_id' => 'TCAT0004', 'name' => 'Probationary', 'description' => 'Probationary Teachers (Teachers in their probation period)', 'created_at' => $now, 'updated_at' => $now],
            ['categories_id' => 'TCAT0005', 'name' => 'Contract-basis', 'description' => 'Contract-based Teachers (Teachers employed on a contract basis)', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($categories as $category) {
            TeacherCategory::create($category);
        }
    }
}
