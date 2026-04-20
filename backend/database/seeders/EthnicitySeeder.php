<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ethnicity;
use Carbon\Carbon;

class EthnicitySeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');

        $ethnicities = [
            ['ethnicity_id' => 'E01', 'ethnicity_name' => 'Sinhalese', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['ethnicity_id' => 'E02', 'ethnicity_name' => 'Sri Lankan Tamil', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['ethnicity_id' => 'E03', 'ethnicity_name' => 'Indian Tamil', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['ethnicity_id' => 'E04', 'ethnicity_name' => 'Sri Lankan Moor', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['ethnicity_id' => 'E05', 'ethnicity_name' => 'Burgher', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['ethnicity_id' => 'E06', 'ethnicity_name' => 'Other', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($ethnicities as $ethnicity) {
            Ethnicity::firstOrCreate(['ethnicity_id' => $ethnicity['ethnicity_id']], $ethnicity);
        }
    }
}
