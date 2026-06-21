<?php

namespace Database\Seeders;

use App\Helpers\NicHelper;
use App\Models\EmployerAppointment;
use App\Models\EmployerCurrentAppointment;
use App\Models\People;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use App\Services\Wso2IsProvisioningService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeacherSeeder extends Seeder
{
    public function run(Wso2IsProvisioningService $wso2Is): void
    {
        $workplaceId = DB::table('workplaces')
            ->where('office_level_id', 'OLID006')
            ->value('workplace_id');

        $subjectId = DB::table('subject_lists')
            ->where('active_status', 1)
            ->value('subject_id');

        if (! $workplaceId || ! $subjectId) {
            $this->command->error('Required lookup data missing. Run institution and subject seeders first.');

            return;
        }

        $teachers = [
            [
                'nic'                  => '199012345678',
                'dob'                  => '1990-01-01',
                'first_appointment_date' => '2015-06-01',
                'title_id'             => 'T02',
                'full_name'            => 'Roshan',
                'gender_id'            => 'G01',
                'religion_id'          => 'R01',
                'ethnicity_id'         => 'E01',
                'civil_status_id'      => 'C01',
                'blood_group_id'       => 'B01',
                'email'                => 'hasantharoshan22@gmail.com',
                'phone'                => '0771234567',
                'district_id'          => 'DIS001',
                'gn_division_id'       => 'GND00001',
                'address_line1'        => '123 Main Street',
                'address_line2'        => 'Colombo',
                'postal_code'          => '10100',
                'appointment_letter_no' => 'SLTS/2015/001',
                'teacher_category'     => 'TCAT0001',
                'teacher_type'         => 'TCHTYPE002',
                'appointment_medium'   => 'MED01',
                'appointment_subject'  => 'ASUB0020',
            ],
            [
                'nic'                  => '198556789012',
                'dob'                  => '1985-03-15',
                'first_appointment_date' => '2010-01-10',
                'title_id'             => 'T01',
                'full_name'            => 'Nimali Sandya Silva',
                'gender_id'            => 'G02',
                'religion_id'          => 'R01',
                'ethnicity_id'         => 'E01',
                'civil_status_id'      => 'C02',
                'blood_group_id'       => 'B03',
                'email'                => 'nimali.silva@teacher.lk',
                'phone'                => '0779876543',
                'district_id'          => 'DIS002',
                'gn_division_id'       => 'GND00002',
                'address_line1'        => '45 Temple Road',
                'address_line2'        => 'Kandy',
                'postal_code'          => '20000',
                'appointment_letter_no' => 'SLTS/2010/042',
                'teacher_category'     => 'TCAT0002',
                'teacher_type'         => 'TCHTYPE003',
                'appointment_medium'   => 'MED01',
                'appointment_subject'  => 'ASUB0024',
            ],
        ];

        foreach ($teachers as $data) {
            DB::transaction(function () use ($data, $workplaceId, $subjectId, $wso2Is) {
                $nic = NicHelper::normalize($data['nic']);

                // 1. People
                $people = People::create([
                    'nic'                => $nic,
                    'title_id'           => $data['title_id'],
                    'full_name'          => $data['full_name'],
                    'name_with_initials' => People::generateInitials($data['full_name']),
                    'gender_id'          => $data['gender_id'],
                    'date_of_birth'      => $data['dob'],
                    'religion_id'        => $data['religion_id'],
                    'ethnicity_id'       => $data['ethnicity_id'],
                    'civil_status_id'    => $data['civil_status_id'],
                    'health_condition'   => '1',
                    'blood_group_id'     => $data['blood_group_id'],
                    'email'              => $data['email'],
                    'phone'              => $data['phone'],
                    'district_id'        => $data['district_id'],
                    'gn_division_id'     => $data['gn_division_id'],
                    'address_line1'      => $data['address_line1'],
                    'address_line2'      => $data['address_line2'],
                    'address_line3'      => null,
                    'postal_code'        => $data['postal_code'],
                    'profile_picture'    => 'default.png',
                    'active_status'      => '1',
                ]);

                // 2. First appointment
                $retirementDate = Carbon::parse($data['dob'])->addYears(55)->toDateString();
                $appointmentId  = EmployerAppointment::generateAppointmentId($data['first_appointment_date']);

                EmployerAppointment::create([
                    'appointment_id'         => $appointmentId,
                    'employee_id'            => $people->people_id,
                    'first_appointment_date' => $data['first_appointment_date'],
                    'retirement_date'        => $retirementDate,
                    'service_id'             => 'SER001',
                    'rank_id'                => 'RANK001',
                    'position_id'            => 'POS001',
                    'office_level_id'        => 'OLID006',
                    'workplace_id'           => $workplaceId,
                    'appointment_letter_no'  => $data['appointment_letter_no'],
                    'appointment_letter'     => 'none.pdf',
                    'active_status'          => '1',
                ]);

                // 3. Teacher
                Teacher::create([
                    'appointment_id'           => $appointmentId,
                    'employee_id'              => $people->people_id,
                    'teacher_category'         => $data['teacher_category'],
                    'teacher_type'             => $data['teacher_type'],
                    'appointment_medium'       => $data['appointment_medium'],
                    'appointment_subject'      => $data['appointment_subject'],
                    'main_subject'             => $subjectId,
                    'current_teaching_subject' => $subjectId,
                ]);

                // 4. Current appointment
                EmployerCurrentAppointment::create([
                    'appointment_id'  => $appointmentId,
                    'employee_id'     => $people->people_id,
                    'appoint_date'    => $data['first_appointment_date'],
                    'service_id'      => 'SER001',
                    'rank_id'         => 'RANK001',
                    'office_level_id' => 'OLID006',
                    'position_id'     => 'POS001',
                    'workplace_id'    => $workplaceId,
                ]);

                // 5. System user
                $user = User::create([
                    'nic'       => $nic,
                    'people_id' => $people->people_id,
                    'name'      => $people->name_with_initials,
                    'email'     => $data['email'],
                    'contact'   => $data['phone'],
                    'password'  => 'password@123',
                ]);

                $user->assignRole('teacher');

                $wso2Is->provisionUser($user, 'password@123', 'teacher');
            });
        }
    }
}
