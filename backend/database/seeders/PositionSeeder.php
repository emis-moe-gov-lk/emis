<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Position;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            [
                /*
                |--------------------------------------------------------------------------
                | SLTS
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS001',
                'service_id'    => 'SER001',
                'position_name' => 'Teacher',
                'description'   => 'Responsible for teaching and student development',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS002',
                'service_id'    => 'SER001',
                'position_name' => 'Teacher(Section Head)',
                'description'   => 'Responsible for teaching and student development',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS003',
                'service_id'    => 'SER001',
                'position_name' => 'Principal(Acting)',
                'description'   => 'Acting Head of the school, responsible for administration',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | SLTES
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS004',
                'service_id'    => 'SER002',
                'position_name' => 'Teacher Educator',
                'description'   => 'Instructor, teacher training center',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | SLTAS
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS005',
                'service_id'    => 'SER003',
                'position_name' => 'Teacher Advisor',
                'description'   => 'In-service Advisor',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | SLPS
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS006',
                'service_id'    => 'SER004',
                'position_name' => 'Principal',
                'description'   => 'Head of the school, responsible for administration',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS007',
                'service_id'    => 'SER004',
                'position_name' => 'Assistant Principal',
                'description'   => 'SUb-Head of the school, responsible for administration',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS008',
                'service_id'    => 'SER004',
                'position_name' => 'Deputy Principal',
                'description'   => 'Sub-Head of the school, responsible for administration',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | SLEAS
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS009',
                'service_id'    => 'SER005',
                'position_name' => 'Principal(SLEAS)',
                'description'   => 'Head of the school, responsible for administration',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS010',
                'service_id'    => 'SER005',
                'position_name' => 'Divisional Director of Education',
                'description'   => 'Handles Divisional office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS011',
                'service_id'    => 'SER005',
                'position_name' => 'Zonal Director of Education',
                'description'   => 'Handles Zonal office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS012',
                'service_id'    => 'SER005',
                'position_name' => 'Additional Zonal Director of Education',
                'description'   => 'Handles Zonal office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS013',
                'service_id'    => 'SER005',
                'position_name' => 'Zonal Deputy Director of Education',
                'description'   => 'Handles Zonal office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS014',
                'service_id'    => 'SER005',
                'position_name' => 'Zonal Assistant Director of Education',
                'description'   => 'Handles Zonal office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS015',
                'service_id'    => 'SER005',
                'position_name' => 'Provincial Director of Education',
                'description'   => 'Handles Provincial office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS016',
                'service_id'    => 'SER005',
                'position_name' => 'Additional Provincial Director of Education',
                'description'   => 'Handles Provincial office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS017',
                'service_id'    => 'SER005',
                'position_name' => 'Provincial Deputy Director of Education',
                'description'   => 'Handles Provincial office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS018',
                'service_id'    => 'SER005',
                'position_name' => 'Provincial Assistant Director of Education',
                'description'   => 'Handles Provincial office administration and clerical duties',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | SLAS
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS019',
                'service_id'    => 'SER006',
                'position_name' => 'Secretary',
                'description'   => 'Handles Provincial MOE administration and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS020',
                'service_id'    => 'SER006',
                'position_name' => 'Additional Secretary',
                'description'   => 'Handles Provincial MOE administration and clerical duties',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | DOS
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS021',
                'service_id'    => 'SER007',
                'position_name' => 'Development Officer',
                'description'   => 'Handles office File Works and clerical duties',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | MSO
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS022',
                'service_id'    => 'SER008',
                'position_name' => 'Management Assistant',
                'description'   => 'Handles office File Works and clerical duties',
                'active_status' => '1',
            ],
            [
                /*
                |--------------------------------------------------------------------------
                | SLAcS
                |--------------------------------------------------------------------------
                */
                'position_id'   => 'POS023',
                'service_id'    => 'SER009',
                'position_name' => 'Accountant (Zonal)',
                'description'   => 'Handles office File Works and clerical duties',
                'active_status' => '1',
            ],
            [
                'position_id'   => 'POS024',
                'service_id'    => 'SER009',
                'position_name' => 'Accountant (Provincial)',
                'description'   => 'Handles office File Works and clerical duties',
                'active_status' => '1',
            ],

        ];

        foreach ($positions as $pos) {
            Position::updateOrCreate(
                ['position_id' => $pos['position_id']], // unique check
                $pos
            );
        }
    }
}
