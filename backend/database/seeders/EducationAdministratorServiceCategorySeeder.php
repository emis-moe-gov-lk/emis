<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EducationAdministratorServiceCategory;

class EducationAdministratorServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $categories = [
            [
                'category_id'   => 'EASC001',
                'category_name' => 'Open General',
                'active_status' => true,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'category_id'   => 'EASC002',
                'category_name' => 'Limited General',
                'active_status' => true,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'category_id'   => 'EASC003',
                'category_name' => 'Limited Special',
                'active_status' => true,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'category_id'   => 'EASC004',
                'category_name' => 'Experienced Based',
                'active_status' => true,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'category_id'   => 'EASC005',
                'category_name' => 'Other',
                'active_status' => true,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
        ];

        foreach ($categories as $category) {
            EducationAdministratorServiceCategory::create($category);
        }
    }
}
