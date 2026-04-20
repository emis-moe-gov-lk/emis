<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TeacherType;
use Carbon\Carbon;

class TeacherTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');
        $teacherTypes = [
            ['teacher_types_id' => 'TCHTYPE001', 'type_name' => 'Primary School Teachers', 'created_at' => $now, 'updated_at' => $now],
            ['teacher_types_id' => 'TCHTYPE002', 'type_name' => '1-11 Teachers', 'created_at' => $now, 'updated_at' => $now],
            ['teacher_types_id' => 'TCHTYPE003', 'type_name' => '6-11 Teachers', 'created_at' => $now, 'updated_at' => $now],
            ['teacher_types_id' => 'TCHTYPE004', 'type_name' => '6-13 Teachers', 'created_at' => $now, 'updated_at' => $now],
            ['teacher_types_id' => 'TCHTYPE005', 'type_name' => '12-13 Teachers', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($teacherTypes as $type) {
            TeacherType::updateOrCreate(
                ['teacher_types_id' => $type['teacher_types_id']],
                $type
            );
        }
    }
}
