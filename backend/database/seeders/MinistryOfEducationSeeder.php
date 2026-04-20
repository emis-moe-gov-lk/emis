<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MinistryOfEducationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('ministry_of_education_offices')->insert([
            //Ministry of Education
            [
                'workplace_id' => 'MOE0000001',
                'name' => 'Ministry of Education',
                'short_name' => 'MOE',
                'email' => 'info@emis.lk',
                'phone' => '0112785141',
                'address' => 'Isurupaya, Baththaramulla, Sri Lanka',
                'postal_code' => '10120',
                'latitude' => '6.890771237920349',
                'longitude' => '79.93037145427841',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ]
        ]);
    }
}