<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PrincipalRecruitmentCategory;

class PrincipalRecruitmentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $categories = [
            [
                'category_id' => 'PRC001',
                'category_name' => 'Supra Grade',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category_id' => 'PRC002',
                'category_name' => 'Numeric Grade',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($categories as $category) {
            PrincipalRecruitmentCategory::updateOrCreate(
                ['category_id' => $category['category_id']],
                $category
            );
        }
    }
}
