<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InstitutionGenderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $genders = [
            ['gender_id' => 'IGID01', 'name' => 'Boys',   'active_status' => '1'],
            ['gender_id' => 'IGID02', 'name' => 'Girls', 'active_status' => '1'],
            ['gender_id' => 'IGID03', 'name' => 'Mixed',  'active_status' => '1'],
        ];

        foreach ($genders as $gender) {
            DB::table('institution_genders')->insert([
                'gender_id'     => $gender['gender_id'],
                'name'          => $gender['name'],
                'active_status' => $gender['active_status'],
                'created_at'    => Carbon::now(),
                'updated_at'    => Carbon::now(),
            ]);
        }
    }
}
