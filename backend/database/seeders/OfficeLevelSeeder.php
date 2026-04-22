<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\OfficeLevel;

class OfficeLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $officeLevels = [
            ['office_level_id' => 'OLID001', 'office_level_rank' => 1, 'office_level_name' => 'Ministry'],
            ['office_level_id' => 'OLID002', 'office_level_rank' => 2, 'office_level_name' => 'Provincial Ministry'],
            ['office_level_id' => 'OLID003', 'office_level_rank' => 3, 'office_level_name' => 'Provincial Education Office'],
            ['office_level_id' => 'OLID004', 'office_level_rank' => 4, 'office_level_name' => 'Zonal Education Office'],
            ['office_level_id' => 'OLID005', 'office_level_rank' => 5, 'office_level_name' => 'Divisional Education Office'],
            ['office_level_id' => 'OLID006', 'office_level_rank' => 6, 'office_level_name' => 'Institution'],
        ];

        foreach ($officeLevels as $level) {
            OfficeLevel::updateOrCreate(
                ['office_level_id' => $level['office_level_id']], // check by ID
                [
                    'office_level_rank' => $level['office_level_rank'],
                    'office_level_name' => $level['office_level_name'],
                    'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                    'updated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                ]
            );
        }
    }
}
