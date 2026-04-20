<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\User;
use App\Models\People;
use App\Models\EmployerAppointment;
use App\Models\EmployerCurrentAppointment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use App\Helpers\NicHelper;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure the role exists
        $superAdminRole = Role::firstOrCreate(['name' => 'super admin']);

        $superAdminNic = NicHelper::normalize('999999999999');

        // Create or update People record (Eloquent => encryption + nic_hash applied)
        $person = People::updateOrCreate(
            ['nic_hash' => NicHelper::hash($superAdminNic)], // check via hash
            [
                'nic'            => $superAdminNic, // encrypted automatically by mutator
                'nic_hash'       => NicHelper::hash($superAdminNic), // deterministic hash for uniqueness

                //removing the people id commend

                'people_id'      => strtoupper(Str::random(12)),
                'title_id'       => 'T01',
                'full_name'      => 'System Super Admin',
                'name_with_initials' => 'S.S.A',
                'gender_id'         => 'G01',
                'date_of_birth'  => '1990-01-01',
                'religion_id'    => 'R01',
                'ethnicity_id'   => 'E01',
                'civil_status_id' => 'C01',
                'health_condition' => '0',
                'blood_group_id' => 'B01',
                'email'          => 'superadmin@example.com',
                'phone'          => '0712345678',
                'district_id'    => 'DIS001',
                'gn_division_id' => 'GND00001',
                'address_line1'  => 'Main Office',
                'address_line2'  => 'Colombo',
                'address_line3'  => 'Sri Lanka',
                'postal_code'    => '00100',
                'profile_picture' => 'default.png',
                'active_status'  => '1',
                'created_at'     => Carbon::now(),
                'updated_at'     => Carbon::now(),
            ]
        );

        // Create or update User linked to People
        $user = User::updateOrCreate(
            ['nic_hash' => $person->nic_hash], // uniqueness check via hash
            [
                'nic'           => $superAdminNic,  // will be encrypted
                'nic_hash'      => $person->nic_hash,
                'people_id'     => $person->people_id,
                'name'          => $person->name_with_initials,
                'email'         => 'superadmin@example.com',
                'contact'       => '0712345678',
                'password'      => 'password@*',
                'active_status' => '1',
            ]
        );

        // Create Appointment
        $appointment = EmployerAppointment::updateOrCreate(
            ['employee_id' => $person->people_id],
            [

                // removing commend

                'appointment_id'        => strtoupper(Str::random(12)),
                'first_appointment_date' => now(),
                'retirement_date'       => now()->addYears(35),
                'service_id'            => 'SER006',
                'rank_id'               => 'RANK018',
                'position_id'           => 'POS003',
                'office_level_id'       => 'OLID001',
                'workplace_id'          => 'MOE0000001',
                'appointment_letter_no' => 'LETTER001',
                'appointment_letter'    => 'letter.pdf',
                'active_status'         => '1',
            ]
        );

        // Current Appointment
        EmployerCurrentAppointment::updateOrCreate(
            ['employee_id' => $person->people_id],
            [
                'appointment_id' => $appointment->appointment_id,
                'appoint_date'   => $appointment->first_appointment_date,
                'service_id'     => $appointment->service_id,
                'rank_id'        => $appointment->rank_id,
                'office_level_id' => $appointment->office_level_id,
                'position_id'    => $appointment->position_id,
                'workplace_id'   => $appointment->workplace_id,
            ]
        );

        // Assign role
        $user->assignRole($superAdminRole);

        // ---------------------------------------------------------------
        // Second Super Admin
        // ---------------------------------------------------------------
        $superAdmin2Nic = NicHelper::normalize('888888888888');

        $person2 = People::updateOrCreate(
            ['nic_hash' => NicHelper::hash($superAdmin2Nic)],
            [
                'nic'                => $superAdmin2Nic,
                'nic_hash'           => NicHelper::hash($superAdmin2Nic),
                'people_id'          => strtoupper(Str::random(12)),
                'title_id'           => 'T01',
                'full_name'          => 'System Super Admin 2',
                'name_with_initials' => 'S.S.A2',
                'gender_id'          => 'G01',
                'date_of_birth'      => '1992-01-01',
                'religion_id'        => 'R01',
                'ethnicity_id'       => 'E01',
                'civil_status_id'    => 'C01',
                'health_condition'   => '0',
                'blood_group_id'     => 'B01',
                'email'              => 'mohammedshadhir5@gmail.com',
                'phone'              => '0712345679',
                'district_id'        => 'DIS001',
                'gn_division_id'     => 'GND00001',
                'address_line1'      => 'Main Office',
                'address_line2'      => 'Colombo',
                'address_line3'      => 'Sri Lanka',
                'postal_code'        => '00100',
                'profile_picture'    => 'default.png',
                'active_status'      => '1',
                'created_at'         => Carbon::now(),
                'updated_at'         => Carbon::now(),
            ]
        );

        $user2 = User::updateOrCreate(
            ['nic_hash' => $person2->nic_hash],
            [
                'nic'           => $superAdmin2Nic,
                'nic_hash'      => $person2->nic_hash,
                'people_id'     => $person2->people_id,
                'name'          => $person2->name_with_initials,
                'email'         => 'mohammedshadhir5@gmail.com',
                'contact'       => '0712345679',
                'password'      => 'password@*',
                'active_status' => '1',
            ]
        );

        $appointment2 = EmployerAppointment::updateOrCreate(
            ['employee_id' => $person2->people_id],
            [
                'appointment_id'         => strtoupper(Str::random(12)),
                'first_appointment_date' => now(),
                'retirement_date'        => now()->addYears(35),
                'service_id'             => 'SER006',
                'rank_id'                => 'RANK018',
                'position_id'            => 'POS003',
                'office_level_id'        => 'OLID001',
                'workplace_id'           => 'MOE0000001',
                'appointment_letter_no'  => 'LETTER002',
                'appointment_letter'     => 'letter.pdf',
                'active_status'          => '1',
            ]
        );

        EmployerCurrentAppointment::updateOrCreate(
            ['employee_id' => $person2->people_id],
            [
                'appointment_id'  => $appointment2->appointment_id,
                'appoint_date'    => $appointment2->first_appointment_date,
                'service_id'      => $appointment2->service_id,
                'rank_id'         => $appointment2->rank_id,
                'office_level_id' => $appointment2->office_level_id,
                'position_id'     => $appointment2->position_id,
                'workplace_id'    => $appointment2->workplace_id,
            ]
        );

        $user2->assignRole($superAdminRole);
    }
}
