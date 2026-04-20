<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceRank;
use Carbon\Carbon;

class ServiceRankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');
        $ranks = [
            // Sri Lanka Teacher Service(SLTS)
            [
                'rank_id'   => 'RANK001',
                'service_id'=> 'SER001', // Education Service
                'rank_name' => '3-II',
                'description' => 'Entry-level rank for Teacher Service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK002',
                'service_id'=> 'SER001',
                'rank_name' => '3-I(a)',
                'description' => 'Entry-level rank for Teacher Service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK003',
                'service_id'=> 'SER001',
                'rank_name' => '3-I(b)',
                'description' => 'Entry-level rank in Teacher Service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK004',
                'service_id'=> 'SER001',
                'rank_name' => '3-I(c)',
                'description' => 'Entry-level rank in Teacher Service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK005',
                'service_id'=> 'SER001',
                'rank_name' => '2-II',
                'description' => 'Second rank in Teacher Service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK006',
                'service_id'=> 'SER001',
                'rank_name' => '2-I',
                'description' => 'Second rank in Teacher Service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK007',
                'service_id'=> 'SER001',
                'rank_name' => '1',
                'description' => 'Top rank in Teacher Service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Sri Lanka Teacher Educator Service(SLTES)
            [
                'rank_id'   => 'RANK008',
                'service_id'=> 'SER002',
                'rank_name' => 'I',
                'description' => 'Top rank in Teacher Educator service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Sri Lanka Teacher Advisor Service(SLTAS)
            [
                'rank_id'   => 'RANK009',
                'service_id'=> 'SER003',
                'rank_name' => 'I',
                'description' => 'Top rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Sri Lanka Principal Service(SLPS)
            [
                'rank_id'   => 'RANK010',
                'service_id'=> 'SER004',
                'rank_name' => 'III',
                'description' => 'Entry-level rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK011',
                'service_id'=> 'SER004',
                'rank_name' => 'II',
                'description' => 'Second rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK012',
                'service_id'=> 'SER004',
                'rank_name' => 'I',
                'description' => 'Top rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Sri Lanka education Administrative Service
            [
                'rank_id'   => 'RANK013',
                'service_id'=> 'SER005',
                'rank_name' => 'III',
                'description' => 'Entry-level rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK014',
                'service_id'=> 'SER005',
                'rank_name' => 'II',
                'description' => 'Second rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK015',
                'service_id'=> 'SER005',
                'rank_name' => 'I',
                'description' => 'Top rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Sri Lanka Administrative Service(SLAS)
            [
                'rank_id'   => 'RANK016',
                'service_id'=> 'SER006',
                'rank_name' => 'III',
                'description' => 'Entry-level rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK017',
                'service_id'=> 'SER006',
                'rank_name' => 'II',
                'description' => 'Second rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK018',
                'service_id'=> 'SER006',
                'rank_name' => 'I',
                'description' => 'Top rank in administrative service',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Development Officer Service(DOS)
            [
                'rank_id'   => 'RANK019',
                'service_id'=> 'SER007',
                'rank_name' => 'III',
                'description' => 'Entry-level, often requiring a degree, focusing on data collection, basic reports, and project support.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK020',
                'service_id'=> 'SER007',
                'rank_name' => 'II',
                'description' => 'Promotion from Grade III (around 10 years) with satisfactory performance, involving more responsibility in planning and implementation.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK021',
                'service_id'=> 'SER007',
                'rank_name' => 'I',
                'description' => 'Achieved after significant service in Grade II (e.g., 9 years), requiring higher performance and increments.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK022',
                'service_id'=> 'SER007',
                'rank_name' => 'Super Grade',
                'description' => 'The highest level, for senior officers, often requiring extensive experience and meeting specific service criteria.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Management Service Officer(MSO)
            [
                'rank_id'   => 'RANK023',
                'service_id'=> 'SER008',
                'rank_name' => 'III',
                'description' => 'Entry-level, often requiring a degree, focusing on data collection, basic reports, and project support.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK024',
                'service_id'=> 'SER008',
                'rank_name' => 'II',
                'description' => 'Promotion from Grade III (around 10 years) with satisfactory performance, involving more responsibility in planning and implementation.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK025',
                'service_id'=> 'SER008',
                'rank_name' => 'I',
                'description' => 'Achieved after significant service in Grade II (e.g., 9 years), requiring higher performance and increments.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK026',
                'service_id'=> 'SER008',
                'rank_name' => 'Supra Grade',
                'description' => 'The highest level, for senior officers, often requiring extensive experience and meeting specific service criteria.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],

            // Sri Lanka Accountants Service(SLAcS)
            [
                'rank_id'   => 'RANK027',
                'service_id'=> 'SER009',
                'rank_name' => 'III',
                'description' => 'The entry-level executive grade for new officers appointed to the service.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK028',
                'service_id'=> 'SER009',
                'rank_name' => 'II',
                'description' => 'Officers are promoted to this grade after satisfying specific service and efficiency bar requirements.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK029',
                'service_id'=> 'SER009',
                'rank_name' => 'I',
                'description' => 'Promotion to this grade is based on seniority, merit, and performance, allowing officers to hold senior positions.',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
            [
                'rank_id'   => 'RANK030',
                'service_id'=> 'SER009',
                'rank_name' => 'Special',
                'description' => 'This is the highest rank within the service, typically held by officers appointed to top executive and financial management positions such as Chief Financial Officer or Director (Finance).',
                'active_status' => '1',
                'created_at' => $now, 
                'updated_at' => $now
            ],
        ];

        foreach ($ranks as $rank) {
            ServiceRank::updateOrCreate(
                ['rank_id' => $rank['rank_id']], // check uniqueness
                $rank
            );
        }
    }
}
