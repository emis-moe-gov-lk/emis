<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Title;
use Carbon\Carbon;

class TitleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');
        $titles = [
            ['title_id' => 'T01', 'title_name' => 'Mr.', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['title_id' => 'T02', 'title_name' => 'Mrs.', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['title_id' => 'T03', 'title_name' => 'Miss', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['title_id' => 'T04', 'title_name' => 'Dr.', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
            ['title_id' => 'T05', 'title_name' => 'Prof.', 'active_status' => '1', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($titles as $title) {
            Title::firstOrCreate(
                ['title_id' => $title['title_id']],
                $title
            );
        }
    }
}
