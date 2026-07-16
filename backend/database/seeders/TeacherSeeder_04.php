<?php

namespace Database\Seeders;

use App\Helpers\NicHelper;
use App\Models\EmployerAppointment;
use App\Models\EmployerCurrentAppointment;
use App\Models\People;
use App\Models\Teacher;
use App\Models\User;
use App\Services\Wso2IsProvisioningService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeacherSeeder_04 extends Seeder
{
    public function run(Wso2IsProvisioningService $wso2Is): void
    {
        // ST. ANTHONY'S NATIONAL SCHOOL, WATTALA — Kelaniya zone (ZEO0000005)
        // Looked up by workplace_id because the name field has a data-quality issue in the seeder
        $workplaceId = DB::table('institutions')
            ->where('workplace_id', 'INS0001001')
            ->value('workplace_id');

        if (! $workplaceId) {
            $this->command->error('Kelaniya zone school not found. Run institution seeders first.');

            return;
        }

        $teachers = [
            [
                'nic'                    => '199305600999',
                'dob'                    => '1993-02-25',
                'title_id'               => 'T02',
                'full_name'              => 'Chamara Bandara Dissanayake',
                'gender_id'              => 'G01',
                'religion_id'            => 'R01',
                'ethnicity_id'           => 'E01',
                'civil_status_id'        => 'C01',
                'blood_group_id'         => 'B02',
                'email'                  => 'chamara.bandara@emis.edu.lk',
                'phone'                  => '0771234999',
                'health_condition'       => '1',
                'district_id'            => 'DIS002',
                'gn_division_id'         => 'GND00002',
                'address_line1'          => '78 Station Road',
                'address_line2'          => 'Veyangoda',
                'address_line3'          => 'Western Province',
                'postal_code'            => '11000',
                'first_appointment_date' => '2018-03-01',
                'appointment_letter_no'  => 'SLTS/2018/KEL001',
                'w_op_no'                => 'WOP003999',
                'pay_sheet_no'           => 'PAY003999',
                'teacher_category'       => 'TCAT0001',
                'teacher_type'           => 'TCHTYPE001',
                'appointment_medium'     => 'MED01',
                'appointment_subject'    => 'ASUB0001',
                'main_subject'           => 'SUB0001',
                'secondary_subject'      => 'SUB0004',
                'password'               => 'Teacher@Kelaniya1',
            ],
        ];

        $created = 0;
        $skipped = 0;
        $total   = count($teachers);

        foreach ($teachers as $index => $data) {
            DB::transaction(function () use ($data, $workplaceId, $wso2Is, &$created, &$skipped) {
                $nic = NicHelper::normalize($data['nic']);

                $existingPeople = People::where('nic_hash', NicHelper::hash($nic))->first();

                if ($existingPeople && $existingPeople->teacher()->exists()) {
                    $this->command->warn("Teacher {$data['full_name']} already exists — skipping.");
                    $skipped++;

                    return;
                }

                $people = $existingPeople ?? People::create([
                    'nic'                => $nic,
                    'title_id'           => $data['title_id'],
                    'full_name'          => $data['full_name'],
                    'name_with_initials' => People::generateInitials($data['full_name']),
                    'gender_id'          => $data['gender_id'],
                    'date_of_birth'      => $data['dob'],
                    'religion_id'        => $data['religion_id'],
                    'ethnicity_id'       => $data['ethnicity_id'],
                    'civil_status_id'    => $data['civil_status_id'],
                    'health_condition'   => $data['health_condition'],
                    'blood_group_id'     => $data['blood_group_id'],
                    'email'              => $data['email'],
                    'phone'              => $data['phone'],
                    'district_id'        => $data['district_id'],
                    'gn_division_id'     => $data['gn_division_id'],
                    'address_line1'      => $data['address_line1'],
                    'address_line2'      => $data['address_line2'],
                    'address_line3'      => $data['address_line3'],
                    'postal_code'        => $data['postal_code'],
                    'profile_picture'    => 'default.png',
                    'active_status'      => '1',
                ]);

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
                    'w_op_no'                => $data['w_op_no'],
                    'pay_sheet_no'           => $data['pay_sheet_no'],
                    'active_status'          => '1',
                ]);

                Teacher::create([
                    'appointment_id'           => $appointmentId,
                    'employee_id'              => $people->people_id,
                    'teacher_category'         => $data['teacher_category'],
                    'teacher_type'             => $data['teacher_type'],
                    'appointment_medium'       => $data['appointment_medium'],
                    'appointment_subject'      => $data['appointment_subject'],
                    'main_subject'             => $data['main_subject'],
                    'secondary_subject'        => $data['secondary_subject'],
                    'current_teaching_subject' => $data['main_subject'],
                ]);

                EmployerCurrentAppointment::create([
                    'appointment_id'        => $appointmentId,
                    'employee_id'           => $people->people_id,
                    'appoint_date'          => $data['first_appointment_date'],
                    'appointment_letter_no' => $data['appointment_letter_no'],
                    'service_id'            => 'SER001',
                    'rank_id'               => 'RANK001',
                    'office_level_id'       => 'OLID006',
                    'position_id'           => 'POS001',
                    'workplace_id'          => $workplaceId,
                ]);

                $user = User::create([
                    'nic'       => $nic,
                    'people_id' => $people->people_id,
                    'name'      => $people->name_with_initials,
                    'email'     => $data['email'],
                    'contact'   => $data['phone'],
                    'password'  => $data['password'],
                ]);

                $user->assignRole('teacher');

                $wso2Is->provisionUser($user, $data['password'], 'teacher');

                $this->command->info("Kelaniya zone teacher {$data['full_name']} created and provisioned.");

                $created++;
            });

            $this->command->getOutput()->writeln(
                $this->progressBar($index + 1, $total, $created, $skipped)
            );
        }

        $this->command->info("TeacherSeeder_04 complete: {$created} created, {$skipped} skipped.");
    }

    private function progressBar(int $current, int $total, int $created, int $skipped, int $width = 30): string
    {
        $percent = $total > 0 ? (int) floor(($current / $total) * 100) : 0;
        $filled  = $total > 0 ? (int) floor(($current / $total) * $width) : 0;

        $bar = str_repeat('=', max(0, $filled - 1)) . ($filled > 0 ? '>' : '');
        $bar = str_pad($bar, $width, ' ');

        return "  [{$bar}] {$percent}% ({$current}/{$total}) created={$created} skipped={$skipped}";
    }
}
