<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstitutionEthnisitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ethnicities = [
            ['ethnicity_id' => 'SETH01', 'ethnicity_name' => 'Sinhala', 'active_status' => true, 'created_at' => Carbon::now()->format('Y-m-d H:i:s'), 'updated_at' => Carbon::now()->format('Y-m-d H:i:s')],
            ['ethnicity_id' => 'SETH02', 'ethnicity_name' => 'Tamil', 'active_status' => true, 'created_at' => Carbon::now()->format('Y-m-d H:i:s'), 'updated_at' => Carbon::now()->format('Y-m-d H:i:s')],
            ['ethnicity_id' => 'SETH03', 'ethnicity_name' => 'Muslim', 'active_status' => true, 'created_at' => Carbon::now()->format('Y-m-d H:i:s'), 'updated_at' => Carbon::now()->format('Y-m-d H:i:s')],
        ];

        DB::table('institution_ethnisities')->insert($ethnicities);
    }
}
