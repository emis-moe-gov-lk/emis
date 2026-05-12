<?php

namespace Database\Seeders;

use App\Models\RecruitmentCategory;
use Illuminate\Database\Seeder;

class RecruitmentCategorySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $categories = [
            ['category_id' => 'RC001', 'category_name' => 'Open General'],
            ['category_id' => 'RC002', 'category_name' => 'Limited General'],
            ['category_id' => 'RC003', 'category_name' => 'Limited Special'],
            ['category_id' => 'RC004', 'category_name' => 'Experience Based'],
            ['category_id' => 'RC005', 'category_name' => 'Other'],
        ];

        foreach ($categories as $category) {
            RecruitmentCategory::updateOrCreate(
                ['category_id' => $category['category_id']],
                array_merge($category, ['active_status' => true, 'created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}
