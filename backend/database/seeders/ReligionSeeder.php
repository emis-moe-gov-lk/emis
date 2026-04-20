<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Religion;
use Carbon\Carbon;

class ReligionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');

        $religions = [
            ['religion_id' => 'R01', 'religion_name' => 'Buddhism', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['religion_id' => 'R02', 'religion_name' => 'Hinduism', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['religion_id' => 'R03', 'religion_name' => 'Islam', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['religion_id' => 'R04', 'religion_name' => 'Christianity', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['religion_id' => 'R05', 'religion_name' => 'Other', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($religions as $religion) {
            Religion::firstOrCreate(['religion_id' => $religion['religion_id']], $religion);
        }
    }
}
