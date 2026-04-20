<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DistrictSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $districts = [
            //Districts
            array('district_id' => 'DIS001', 'district_code' => 1, 'district_name' => 'Nuwara Eliya','province_id' => 'PRO05','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS002', 'district_code' => 2, 'district_name' => 'Matale','province_id' => 'PRO05','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS003', 'district_code' => 3, 'district_name' => 'Kandy','province_id' => 'PRO05','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS004', 'district_code' => 4, 'district_name' => 'Trincomalee','province_id' => 'PRO07','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS005', 'district_code' => 5, 'district_name' => 'Batticaloa','province_id' => 'PRO07','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS006', 'district_code' => 6, 'district_name' => 'Polonnaruwa','province_id' => 'PRO04','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS007', 'district_code' => 7, 'district_name' => 'Anuradhapura','province_id' => 'PRO04','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS008', 'district_code' => 8, 'district_name' => 'Puttalam','province_id' => 'PRO02','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS009', 'district_code' => 9, 'district_name' => 'Kurunegala','province_id' => 'PRO02','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS010', 'district_code' => 10, 'district_name' => 'Vavuniya','province_id' => 'PRO01','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS011', 'district_code' => 11, 'district_name' => 'Mulattivu','province_id' => 'PRO01','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS012', 'district_code' => 12, 'district_name' => 'Mannar','province_id' => 'PRO01','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS013', 'district_code' => 13, 'district_name' => 'Killinochchi','province_id' => 'PRO01','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS014', 'district_code' => 14, 'district_name' => 'Jaffna','province_id' => 'PRO01','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS015', 'district_code' => 15, 'district_name' => 'Rathnapura','province_id' => 'PRO06','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS016', 'district_code' => 16, 'district_name' => 'Kegalle','province_id' => 'PRO06','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS017', 'district_code' => 17, 'district_name' => 'Matara','province_id' => 'PRO09','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS018', 'district_code' => 18, 'district_name' => 'Hambantota','province_id' => 'PRO09','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS019', 'district_code' => 19, 'district_name' => 'Galle','province_id' => 'PRO09','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS020', 'district_code' => 20, 'district_name' => 'Badulla','province_id' => 'PRO08','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS021', 'district_code' => 21, 'district_name' => 'Kalutara','province_id' => 'PRO03','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS022', 'district_code' => 22, 'district_name' => 'Gampaha','province_id' => 'PRO03','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS023', 'district_code' => 23, 'district_name' => 'Colombo','province_id' => 'PRO03','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS024', 'district_code' => 24, 'district_name' => 'Moneragala','province_id' => 'PRO08','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s')),
            array('district_id' => 'DIS025', 'district_code' => 25, 'district_name' => 'Ampara','province_id' => 'PRO07','created_at' => Carbon::now()->format('Y-m-d H:i:s'),'updated_at' => Carbon::now()->format('Y-m-d H:i:s'))
        ];
        DB::table('districts_lists')->insert($districts);
    }
}
