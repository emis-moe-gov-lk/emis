<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InstitutionalFacility;

class InstitutionalFacilitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $facilities = [
            [
                'facilities_id' => 'FAC001',
                'name' => 'More Convenient',
                'description' => 'Facilities are easily accessible and fully adequate with no significant difficulties.',
                'active_status' => true,
            ],
            [
                'facilities_id' => 'FAC002',
                'name' => 'Convenient',
                'description' => 'Facilities are generally accessible and adequate with minor limitations.',
                'active_status' => true,
            ],
            [
                'facilities_id' => 'FAC003',
                'name' => 'Not Convenient',
                'description' => 'Facilities are available but access or usage is inconvenient due to noticeable limitations.',
                'active_status' => true,
            ],
            [
                'facilities_id' => 'FAC004',
                'name' => 'Difficult',
                'description' => 'Facilities exist but are difficult to access or use due to significant constraints.',
                'active_status' => true,
            ],
            [
                'facilities_id' => 'FAC005',
                'name' => 'Very Difficult',
                'description' => 'Facilities are severely limited or almost inaccessible, making usage extremely difficult',
                'active_status' => true,
            ],
        ];

        foreach ($facilities as $facility) {
            InstitutionalFacility::updateOrCreate(
                ['facilities_id' => $facility['facilities_id']],
                array_merge($facility, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }
}
