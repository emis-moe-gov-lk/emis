<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProvincialMinistryOfEducationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('provincial_ministry_of_education_offices')->insert([
            [
                'workplace_id' => 'PMOE000001',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - Western Province',
                'short_name' => 'MOE Western',
                'email' => 'info@western.edu.lk',
                'phone' => '0112785146',
                'address' => 'Provincial Ministry of Education, Colombo, Sri Lanka',
                'postal_code' => '10000',
                'latitude' => '6.9271',
                'longitude' => '79.9553',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000002',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - Central Province',
                'short_name' => 'MOE Central',
                'email' => 'info@central.edu.lk',
                'phone' => '0112785142',
                'address' => 'Provincial Ministry of Education, Kandy, Sri Lanka',
                'postal_code' => '20000',
                'latitude' => '7.2906',
                'longitude' => '80.6337',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000003',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - Southern Province',
                'short_name' => 'MOE Southern',
                'email' => 'info@southern.edu.lk',
                'phone' => '0112785147',
                'address' => 'Provincial Ministry of Education, Galle, Sri Lanka',
                'postal_code' => '80000',
                'latitude' => '6.0325',
                'longitude' => '80.2195',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000004',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - Northern Province',
                'short_name' => 'MOE Northern',
                'email' => 'info@northern.edu.lk',
                'phone' => '0112785148',
                'address' => 'Provincial Ministry of Education, Jaffna, Sri Lanka',
                'postal_code' => '40000',
                'latitude' => '9.6618',
                'longitude' => '80.0248',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000005',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - Eastern Province',
                'short_name' => 'MOE Eastern',
                'email' => 'info@eastern.edu.lk',
                'phone' => '0112785143',
                'address' => 'Provincial Ministry of Education, Trincomalee, Sri Lanka',
                'postal_code' => '31000',
                'latitude' => '8.5719',
                'longitude' => '81.2096',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000006',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - North Western Province',
                'short_name' => 'MOE North Western',
                'email' => 'info@northwestern.edu.lk',
                'phone' => '0112785144',
                'address' => 'Provincial Ministry of Education, Kurunegala, Sri Lanka',
                'postal_code' => '60000',
                'latitude' => '7.4822',
                'longitude' => '80.3503',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000007',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - North Central Province',
                'short_name' => 'MOE North Central',
                'email' => 'info@northcentral.edu.lk',
                'phone' => '0112785122',
                'address' => 'Provincial Ministry of Education, Anuradhapura, Sri Lanka',
                'postal_code' => '50000',
                'latitude' => '8.3482',
                'longitude' => '80.4055',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000008',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - Uva Province',
                'short_name' => 'MOE Uva',
                'email' => 'info@uva.edu.lk',
                'phone' => '0112785145',
                'address' => 'Provincial Ministry of Education, Badulla, Sri Lanka',
                'postal_code' => '90000',
                'latitude' => '6.9969',
                'longitude' => '81.0583',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
            [
                'workplace_id' => 'PMOE000009',
                'moe_wp_id' => 'MOE0000001',
                'name' => 'Ministry of Education - Sabaragamuwa Province',
                'short_name' => 'MOE Sabaragamuwa',
                'email' => 'info@sabaragamuwa.edu.lk',
                'phone' => '0112785149',
                'address' => 'Provincial Ministry of Education, Ratnapura, Sri Lanka',
                'postal_code' => '70000',
                'latitude' => '6.6936',
                'longitude' => '80.3834',
                'active_status' => '1',
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')
            ],
        ]);
    }
}
