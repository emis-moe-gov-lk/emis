<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MediumOfInstructionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mediums = [
            ['medium_id' => 'MED01', 'name' => 'Sinhala', 'active_status' => '1'],
            ['medium_id' => 'MED02', 'name' => 'Tamil',   'active_status' => '1'],
            ['medium_id' => 'MED03', 'name' => 'English', 'active_status' => '1'],
        ];

        foreach ($mediums as $medium) {
            DB::table('medium_of_instructions')->insert([
                'medium_id'     => $medium['medium_id'],
                'name'          => $medium['name'],
                'active_status' => $medium['active_status'],
                'created_at'    => Carbon::now(),
                'updated_at'    => Carbon::now(),
            ]);
        }
    }
}
