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
use App\Services\Wso2IsProvisioningService;

class DeoOfficerSeeder extends Seeder
{
    public function run(Wso2IsProvisioningService $wso2Is): void
    {
        // Role must already exist (created by RolePermissionSeeder)
        $deoRole = Role::firstOrCreate(['name' => 'development officer']);

        $deoNic = NicHelper::normalize('777777777777');

        $person = People::updateOrCreate(
            ['nic_hash' => NicHelper::hash($deoNic)],
            [
                'nic'                => $deoNic,
                'nic_hash'           => NicHelper::hash($deoNic),
                'people_id'          => strtoupper(Str::random(12)),
                'title_id'           => 'T01',
                'full_name'          => 'DEO Development Officer',
                'name_with_initials' => 'D.E.O',
                'gender_id'          => 'G01',
                'date_of_birth'      => '1988-06-15',
                'religion_id'        => 'R01',
                'ethnicity_id'       => 'E01',
                'civil_status_id'    => 'C01',
                'health_condition'   => '0',
                'blood_group_id'     => 'B01',
                'email'              => 'deo.officer@emis.lk',
                'phone'              => '0712345680',
                'district_id'        => 'DIS001',
                'gn_division_id'     => 'GND00001',
                'address_line1'      => 'Colombo North DEO',
                'address_line2'      => 'Colombo',
                'address_line3'      => 'Sri Lanka',
                'postal_code'        => '00100',
                'profile_picture'    => 'default.png',
                'active_status'      => '1',
                'created_at'         => Carbon::now(),
                'updated_at'         => Carbon::now(),
            ]
        );

        $user = User::updateOrCreate(
            ['nic_hash' => $person->nic_hash],
            [
                'nic'           => $deoNic,
                'nic_hash'      => $person->nic_hash,
                'people_id'     => $person->people_id,
                'name'          => $person->name_with_initials,
                'email'         => 'deo.officer@emis.lk',
                'contact'       => '0712345680',
                'password'      => 'password@*',
                'active_status' => '1',
            ]
        );

        $appointment = EmployerAppointment::updateOrCreate(
            ['employee_id' => $person->people_id],
            [
                'appointment_id'         => strtoupper(Str::random(12)),
                'first_appointment_date' => now(),
                'retirement_date'        => now()->addYears(30),
                'service_id'             => 'SER007',  // DOS - Development Officer Service
                'rank_id'                => 'RANK019', // Grade III (entry level)
                'position_id'            => 'POS021',  // Development Officer
                'office_level_id'        => 'OLID001',
                'workplace_id'           => 'DEO0000001', // Colombo North DEO
                'appointment_letter_no'  => 'LETTER003',
                'appointment_letter'     => 'letter.pdf',
                'active_status'          => '1',
            ]
        );

        EmployerCurrentAppointment::updateOrCreate(
            ['employee_id' => $person->people_id],
            [
                'appointment_id'  => $appointment->appointment_id,
                'appoint_date'    => $appointment->first_appointment_date,
                'service_id'      => $appointment->service_id,
                'rank_id'         => $appointment->rank_id,
                'office_level_id' => $appointment->office_level_id,
                'position_id'     => $appointment->position_id,
                'workplace_id'    => $appointment->workplace_id,
            ]
        );

        $user->assignRole($deoRole);

        $wso2Is->provisionUser($user, 'Password@123*', 'development officer');
    }
}
