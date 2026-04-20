<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class WorkplacesFromMinistrySeeder extends Seeder
{
    public function run(): void
    {
        DB::disableQueryLog();
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Already existing workplace_ids in workplaces
        $existing = DB::table('workplaces')->pluck('workplace_id');

        $now = Carbon::now();
        $data = [];

        // Get all workplace_ids from ministry_of_education_offices
        $ministryWorkplaces = DB::table('ministry_of_education_offices')
            ->whereNotIn('workplace_id', $existing)
            ->pluck('workplace_id');

        foreach ($ministryWorkplaces as $id) {
            $data[] = [
                'workplace_id'       => $id,
                'office_level_id'    => 'OLID001',
                'parent_workplace_id' => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ];
        }

        // Get all workplace_ids from provincial_ministry_of_education_offices
        $provincialMinistryWorkplaces = DB::table('provincial_ministry_of_education_offices')
            ->whereNotIn('workplace_id', $existing)
            ->pluck('workplace_id');

        foreach ($provincialMinistryWorkplaces as $id) {
            $data[] = [
                'workplace_id'       => $id,
                'office_level_id'    => 'OLID002',
                'parent_workplace_id' => 'MOE0000001', // 'MOE0000001' is the ministry workplace_id
                'created_at'         => $now,
                'updated_at'         => $now,
            ];
        }

        $provincialWorkplaces = DB::table('provincial_education_offices')
            ->whereNotIn('workplace_id', $existing)
            ->get(['workplace_id', 'pmoe_wp_id']); // get() returns objects

        foreach ($provincialWorkplaces as $wp) {
            $data[] = [
                'workplace_id'       => $wp->workplace_id,
                'office_level_id'    => 'OLID003',
                'parent_workplace_id' => $wp->pmoe_wp_id, // link to ministry workplace
                'created_at'         => $now,
                'updated_at'         => $now,
            ];
        }

        $zonalWorkplaces = DB::table('zonal_education_offices')
            ->whereNotIn('workplace_id', $existing)
            ->get(['workplace_id', 'peo_wp_id']); // get() returns objects

        foreach ($zonalWorkplaces as $wp) {
            $data[] = [
                'workplace_id'       => $wp->workplace_id,
                'office_level_id'    => 'OLID004',
                'parent_workplace_id' => $wp->peo_wp_id, // link to ministry workplace
                'created_at'         => $now,
                'updated_at'         => $now,
            ];
        }

        $divisionWorkplaces = DB::table('divisional_education_offices')
            ->whereNotIn('workplace_id', $existing)
            ->get(['workplace_id', 'zeo_wp_id']); // get() returns objects

        foreach ($divisionWorkplaces as $wp) {
            $data[] = [
                'workplace_id'       => $wp->workplace_id,
                'office_level_id'    => 'OLID005',
                'parent_workplace_id' => $wp->zeo_wp_id, // link to ministry workplace
                'created_at'         => $now,
                'updated_at'         => $now,
            ];
        }

        $institutionsWorkplaces = DB::table('institutions')
            ->whereNotIn('workplace_id', $existing)
            ->get(['workplace_id', 'deo_wp_id']); // get() returns objects

        foreach ($institutionsWorkplaces as $wp) {
            $data[] = [
                'workplace_id'       => $wp->workplace_id,
                'office_level_id'    => 'OLID006',
                'parent_workplace_id' => $wp->deo_wp_id, // link to ministry workplace
                'created_at'         => $now,
                'updated_at'         => $now,
            ];
        }


        // Bulk insert if data exists
        if (!empty($data)) {
            DB::table('workplaces')->insert($data);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}
