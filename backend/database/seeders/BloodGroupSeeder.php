<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BloodGroup;
use Carbon\Carbon;

class BloodGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bloodGroups = [
            'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
        ];

        foreach ($bloodGroups as $index => $group) {
            BloodGroup::firstOrCreate(
                ['blood_group' => $group],
                [
                    'blood_group_id' => 'B' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                    'blood_group' => $group,
                    'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                    'updated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                ]
            );
        }
    }
}
