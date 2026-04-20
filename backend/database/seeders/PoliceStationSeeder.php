<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PoliceStation;
use Carbon\Carbon;

class PoliceStationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stations = [
            [
                'police_station_id' => 'PSID01',
                'police_station_name' => 'Colombo Fort Police Station',
                'address' => 'Colombo Fort, Colombo 01',
                'postal_code' => '00100',
                'phone' => '+94 112 345 678',
                'email' => 'colombo.fort@police.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'police_station_id' => 'PSID02',
                'police_station_name' => 'Kandy Central Police Station',
                'address' => 'Kandy Central, Kandy',
                'postal_code' => '20000',
                'phone' => '+94 812 345 678',
                'email' => 'kandy.central@police.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'police_station_id' => 'PSID03',
                'police_station_name' => 'Galle Fort Police Station',
                'address' => 'Galle Fort, Galle',
                'postal_code' => '80000',
                'phone' => '+94 912 345 678',
                'email' => 'galle.fort@police.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'police_station_id' => 'PSID04',
                'police_station_name' => 'Jaffna Town Police Station',
                'address' => 'Jaffna Town, Jaffna',
                'postal_code' => '40000',
                'phone' => '+94 212 345 678',
                'email' => 'jaffna.town@police.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            // Add more stations as needed...
        ];

        foreach ($stations as $station) {
            PoliceStation::firstOrCreate(
                ['police_station_id' => $station['police_station_id']],
                $station
            );
        }
    }
}
