<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MohArea;
use Carbon\Carbon;

class MohAreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mohAreas = [
            [
                'moh_area_id' => 'MOH01',
                'moh_area_name' => 'Colombo MOH Area',
                'address' => 'Colombo, Western Province',
                'postal_code' => '00100',
                'phone' => '+94 112 345 678',
                'email' => 'colombo@moh.gov.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'moh_area_id' => 'MOH02',
                'moh_area_name' => 'Kandy MOH Area',
                'address' => 'Kandy, Central Province',
                'postal_code' => '20000',
                'phone' => '+94 812 345 678',
                'email' => 'kandy@moh.gov.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'moh_area_id' => 'MOH03',
                'moh_area_name' => 'Galle MOH Area',
                'address' => 'Galle, Southern Province',
                'postal_code' => '80000',
                'phone' => '+94 912 345 678',
                'email' => 'galle@moh.gov.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'moh_area_id' => 'MOH04',
                'moh_area_name' => 'Jaffna MOH Area',
                'address' => 'Jaffna, Northern Province',
                'postal_code' => '40000',
                'phone' => '+94 212 345 678',
                'email' => 'jaffna@moh.gov.lk',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            // Add more MOH Areas as needed...
        ];

        foreach ($mohAreas as $area) {
            MohArea::firstOrCreate(
                ['moh_area_id' => $area['moh_area_id']],
                $area
            );
        }
    }
}
