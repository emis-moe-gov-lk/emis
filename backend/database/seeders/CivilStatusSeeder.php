<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CivilStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $civilStatuses = [
            [
                'civil_status_id'   => 'C01',
                'civil_status_name' => 'Single',
                'active_status'     => '1',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
            [
                'civil_status_id'   => 'C02',
                'civil_status_name' => 'Married',
                'active_status'     => '1',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
            [
                'civil_status_id'   => 'C03',
                'civil_status_name' => 'Divorced',
                'active_status'     => '1',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
            [
                'civil_status_id'   => 'C04',
                'civil_status_name' => 'Widowed',
                'active_status'     => '1',
                'created_at'        => $now,
                'updated_at'        => $now,
            ],
        ];

        DB::table('civil_statuses')->insert($civilStatuses);
    }
}
