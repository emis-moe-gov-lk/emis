<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstitutionCategoriesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('institution_categories')->insert([
            [
                'institution_category_id'   => 'ICID001',
                'institution_category_name' => 'Government School',
                'description'               => 'Schools managed by government authorities',
                'active_status'             => '1',
                'created_at'                => now(),
                'updated_at'                => now(),
            ],
            [
                'institution_category_id'   => 'ICID002',
                'institution_category_name' => 'Semi Government School',
                'description'               => 'Schools managed by semi-government authorities',
                'active_status'             => '1',
                'created_at'                => now(),
                'updated_at'                => now(),
            ],
            [
                'institution_category_id'   => 'ICID003',
                'institution_category_name' => 'Private School',
                'description'               => 'Schools managed by private organizations',
                'active_status'             => '1',
                'created_at'                => now(),
                'updated_at'                => now(),
            ],
            [
                'institution_category_id'   => 'ICID004',
                'institution_category_name' => 'International School',
                'description'               => 'Schools following international curriculum',
                'active_status'             => '1',
                'created_at'                => now(),
                'updated_at'                => now(),
            ],
            [
                'institution_category_id'   => 'ICID005',
                'institution_category_name' => 'Piriven School',
                'description'               => 'Schools following Piriven curriculum',
                'active_status'             => '1',
                'created_at'                => now(),
                'updated_at'                => now(),
            ],
        ]);
    }
}
