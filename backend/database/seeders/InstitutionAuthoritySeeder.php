<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\InstitutionAuthority;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class InstitutionAuthoritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $authorities = [
            [
                'authority_id' => 'AUID01',
                'authority_name' => 'National school',
                'description' => 'Central governing body for education policies in the country',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'authority_id' => 'AUID02',
                'authority_name' => 'Provincial school',
                'description' => 'Handles education administration at provincial level',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'authority_id' => 'AUID03',
                'authority_name' => 'Other',
                'description' => 'Other types of educational authorities',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
        ];

        foreach ($authorities as $authority) {
            InstitutionAuthority::firstOrCreate(
                ['authority_id' => $authority['authority_id']],
                $authority
            );
        }
    }
}
