<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\People;
use App\Helpers\NicHelper;

class PeopleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $people = [
            ['nic' => '900000000001', 'title_id' => 'T01', 'full_name' => 'System Super Admin', 'name_with_initials' => 'SSA', 'gender_id' => 'G01', 'date_of_birth' => '1985-01-15', 'religion_id' => 'R01', 'ethnicity_id' => 'E01', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B01', 'email' => 'superadmin@gmail.com', 'phone' => '0700000001', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'Ministry Building', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000002', 'title_id' => 'T01', 'full_name' => 'MOE Administrator', 'name_with_initials' => 'MOE Administrator', 'gender_id' => 'G01', 'date_of_birth' => '1986-02-20', 'religion_id' => 'R01', 'ethnicity_id' => 'E01', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B02', 'email' => 'moeadmin@gmail.com', 'phone' => '0700000002', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'Ministry Building', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000003', 'title_id' => 'T01', 'full_name' => 'PSC Officer', 'name_with_initials' => 'PSC Officer', 'gender_id' => 'G01', 'date_of_birth' => '1987-03-10', 'religion_id' => 'R02', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C02', 'health_condition' => '1', 'blood_group_id' => 'B03', 'email' => 'psc@gmail.com', 'phone' => '0700000003', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'Public Service Office', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000004', 'title_id' => 'T01', 'full_name' => 'Provincial Director', 'name_with_initials' => 'Provincial Director', 'gender_id' => 'G01', 'date_of_birth' => '1982-04-12', 'religion_id' => 'R01', 'ethnicity_id' => 'E01', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B04', 'email' => 'provinciald@gmail.com', 'phone' => '0700000004', 'district_id' => 'DIS002', 'gn_division_id' => 'GND00002', 'address_line1' => 'Provincial Education Office', 'address_line2' => 'Gampaha', 'address_line3' => 'Western Province', 'postal_code' => '11000'],
            ['nic' => '900000000005', 'title_id' => 'T01', 'full_name' => 'Provincial Deputy Director', 'name_with_initials' => 'Provincial Deputy Director', 'gender_id' => 'G02', 'date_of_birth' => '1984-05-09', 'religion_id' => 'R01', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B05', 'email' => 'provincialdd@gmail.com', 'phone' => '0700000005', 'district_id' => 'DIS002', 'gn_division_id' => 'GND00002', 'address_line1' => 'Provincial Education Office', 'address_line2' => 'Gampaha', 'address_line3' => 'Western Province', 'postal_code' => '11000'],
            ['nic' => '900000000006', 'title_id' => 'T01', 'full_name' => 'Provincial Subject Head', 'name_with_initials' => 'Provincial Subject Head', 'gender_id' => 'G01', 'date_of_birth' => '1988-06-14', 'religion_id' => 'R03', 'ethnicity_id' => 'E03', 'civil_status_id' => 'C02', 'health_condition' => '1', 'blood_group_id' => 'B06', 'email' => 'provincialsh@gmail.com', 'phone' => '0700000006', 'district_id' => 'DIS002', 'gn_division_id' => 'GND00002', 'address_line1' => 'Provincial Subject Branch', 'address_line2' => 'Gampaha', 'address_line3' => 'Western Province', 'postal_code' => '11000'],
            ['nic' => '900000000007', 'title_id' => 'T02', 'full_name' => 'Provincial Clerk DEO', 'name_with_initials' => 'Provincial Clerk (DEO)', 'gender_id' => 'G02', 'date_of_birth' => '1990-07-18', 'religion_id' => 'R02', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B07', 'email' => 'provincialdeo@gmail.com', 'phone' => '0700000007', 'district_id' => 'DIS002', 'gn_division_id' => 'GND00002', 'address_line1' => 'Divisional Office Desk', 'address_line2' => 'Gampaha', 'address_line3' => 'Western Province', 'postal_code' => '11000'],
            ['nic' => '900000000008', 'title_id' => 'T01', 'full_name' => 'Zonal Director', 'name_with_initials' => 'Zonal Director', 'gender_id' => 'G01', 'date_of_birth' => '1981-08-11', 'religion_id' => 'R01', 'ethnicity_id' => 'E01', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B08', 'email' => 'zonald@gmail.com', 'phone' => '0700000008', 'district_id' => 'DIS003', 'gn_division_id' => 'GND00003', 'address_line1' => 'Zonal Education Office', 'address_line2' => 'Kalutara', 'address_line3' => 'Western Province', 'postal_code' => '12000'],
            ['nic' => '900000000009', 'title_id' => 'T01', 'full_name' => 'Zonal Deputy Director', 'name_with_initials' => 'Zonal Deputy Director', 'gender_id' => 'G02', 'date_of_birth' => '1983-09-07', 'religion_id' => 'R01', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B01', 'email' => 'zonaldd@gmail.com', 'phone' => '0700000009', 'district_id' => 'DIS003', 'gn_division_id' => 'GND00003', 'address_line1' => 'Zonal Education Office', 'address_line2' => 'Kalutara', 'address_line3' => 'Western Province', 'postal_code' => '12000'],
            ['nic' => '900000000010', 'title_id' => 'T01', 'full_name' => 'Zonal Subject Head', 'name_with_initials' => 'Zonal Subject Head', 'gender_id' => 'G01', 'date_of_birth' => '1989-10-22', 'religion_id' => 'R03', 'ethnicity_id' => 'E03', 'civil_status_id' => 'C02', 'health_condition' => '1', 'blood_group_id' => 'B02', 'email' => 'zonalsh@gmail.com', 'phone' => '0700000010', 'district_id' => 'DIS003', 'gn_division_id' => 'GND00003', 'address_line1' => 'Zonal Subject Branch', 'address_line2' => 'Kalutara', 'address_line3' => 'Western Province', 'postal_code' => '12000'],
            ['nic' => '900000000011', 'title_id' => 'T02', 'full_name' => 'Zonal DEO Officer', 'name_with_initials' => 'Zonal DEO', 'gender_id' => 'G02', 'date_of_birth' => '1991-11-13', 'religion_id' => 'R02', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B03', 'email' => 'zonaldeo@gmail.com', 'phone' => '0700000011', 'district_id' => 'DIS003', 'gn_division_id' => 'GND00003', 'address_line1' => 'Zonal Administration Unit', 'address_line2' => 'Kalutara', 'address_line3' => 'Western Province', 'postal_code' => '12000'],
            ['nic' => '900000000012', 'title_id' => 'T01', 'full_name' => 'Divisional Head', 'name_with_initials' => 'Divisional Head', 'gender_id' => 'G01', 'date_of_birth' => '1980-12-05', 'religion_id' => 'R01', 'ethnicity_id' => 'E01', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B04', 'email' => 'divisionalhead@gmail.com', 'phone' => '0700000012', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'Divisional Education Office', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000013', 'title_id' => 'T02', 'full_name' => 'Divisional DEO Officer', 'name_with_initials' => 'Divisional DEO', 'gender_id' => 'G02', 'date_of_birth' => '1992-01-19', 'religion_id' => 'R02', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C02', 'health_condition' => '1', 'blood_group_id' => 'B05', 'email' => 'divisionaldeo@gmail.com', 'phone' => '0700000013', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'Divisional Education Office', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000014', 'title_id' => 'T01', 'full_name' => 'School Principal', 'name_with_initials' => 'Principal', 'gender_id' => 'G01', 'date_of_birth' => '1984-02-27', 'religion_id' => 'R01', 'ethnicity_id' => 'E01', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B06', 'email' => 'principal@gmail.com', 'phone' => '0700000014', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'National School', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000015', 'title_id' => 'T02', 'full_name' => 'Vice Principal', 'name_with_initials' => 'Vice Principal / Dep Principal', 'gender_id' => 'G02', 'date_of_birth' => '1986-03-03', 'religion_id' => 'R01', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C01', 'health_condition' => '1', 'blood_group_id' => 'B07', 'email' => 'viceprincipal@gmail.com', 'phone' => '0700000015', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'National School', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000016', 'title_id' => 'T01', 'full_name' => 'Teacher Test User', 'name_with_initials' => 'Teacher', 'gender_id' => 'G01', 'date_of_birth' => '1993-04-16', 'religion_id' => 'R03', 'ethnicity_id' => 'E03', 'civil_status_id' => 'C02', 'health_condition' => '1', 'blood_group_id' => 'B08', 'email' => 'teachertest@gmail.com', 'phone' => '0700000016', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'National School', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
            ['nic' => '900000000017', 'title_id' => 'T02', 'full_name' => 'School DEO Officer', 'name_with_initials' => 'School DEO', 'gender_id' => 'G02', 'date_of_birth' => '1994-05-21', 'religion_id' => 'R02', 'ethnicity_id' => 'E02', 'civil_status_id' => 'C02', 'health_condition' => '1', 'blood_group_id' => 'B01', 'email' => 'schooldeo@gmail.com', 'phone' => '0700000017', 'district_id' => 'DIS001', 'gn_division_id' => 'GND00001', 'address_line1' => 'National School', 'address_line2' => 'Colombo', 'address_line3' => 'Western Province', 'postal_code' => '00100'],
        ];

        foreach ($people as $person) {
            $nic = NicHelper::normalize($person['nic']);

            People::updateOrCreate(
                ['nic_hash' => NicHelper::hash($nic)],
                [
                    'nic'                => $nic,
                    'nic_hash'           => NicHelper::hash($nic),
                    'title_id'           => $person['title_id'],
                    'full_name'          => $person['full_name'],
                    'name_with_initials' => $person['name_with_initials'],
                    'gender_id'          => $person['gender_id'],
                    'date_of_birth'      => $person['date_of_birth'],
                    'religion_id'        => $person['religion_id'],
                    'ethnicity_id'       => $person['ethnicity_id'],
                    'civil_status_id'    => $person['civil_status_id'],
                    'health_condition'   => $person['health_condition'],
                    'blood_group_id'     => $person['blood_group_id'],
                    'email'              => $person['email'],
                    'phone'              => $person['phone'],
                    'district_id'        => $person['district_id'],
                    'gn_division_id'     => $person['gn_division_id'],
                    'ds_office_id'       => $person['ds_office_id'] ?? null,
                    'address_line1'      => $person['address_line1'],
                    'address_line2'      => $person['address_line2'],
                    'address_line3'      => $person['address_line3'],
                    'postal_code'        => $person['postal_code'],
                    'profile_picture'    => 'default.png',
                    'active_status'      => '1',
                    'created_at'         => Carbon::now(),
                    'updated_at'         => Carbon::now(),
                ]
            );
        }
    }
}
