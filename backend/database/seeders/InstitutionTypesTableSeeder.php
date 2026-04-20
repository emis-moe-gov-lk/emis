<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstitutionTypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('institution_types')->insert([
            [
                'institution_types_id'   => 'ITID01',
                'institution_types_name' => '1AB',
                'description'            => 'Grade 1 to grade 13 schools with Advanced Level Science, Math, Arts and Commerce',
                'active_status'          => '1',
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'institution_types_id'   => 'ITID02',
                'institution_types_name' => '1C',
                'description'            => 'Grade 1 to grade 13 schools with Advanced Level Arts and Commerce',
                'active_status'          => '1',
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'institution_types_id'   => 'ITID03',
                'institution_types_name' => 'Type 2',
                'description'            => 'Grade 1 to grade 11 schools',
                'active_status'          => '1',
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'institution_types_id'   => 'ITID04',
                'institution_types_name' => 'Type 3',
                'description'            => 'Grade 1 to grade 5 schools',
                'active_status'          => '1',
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            
        ]);
    }
}
