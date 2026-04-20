<?php

namespace Database\Seeders;

use App\Models\GenderList;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GenderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');
        $genders = [
            ['gender_id' => 'G01', 'gender_name' => 'Male', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['gender_id' => 'G02', 'gender_name' => 'Female', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['gender_id' => 'G03', 'gender_name' => 'Other',  'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($genders as $gender) {
            GenderList::updateOrCreate(
                ['gender_id' => $gender['gender_id']], // Unique check
                $gender
            );
        }
    }
}
