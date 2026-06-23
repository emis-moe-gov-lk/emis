<?php

namespace Database\Seeders;

use App\Helpers\NicHelper;
use App\Models\EmployerAppointment;
use App\Models\EmployerCadreSubject;
use App\Models\EmployerCurrentAppointment;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\People;
use App\Models\PeopleEducationQualification;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeacherSeeder_02 extends Seeder
{
    public function run(): void
    {
        $workplaceId = DB::table('workplaces')
            ->where('office_level_id', 'OLID006')
            ->value('workplace_id');

        if (! $workplaceId) {
            $this->command->error('Required lookup data missing. Run institution seeders first.');

            return;
        }

        $teachers = [
            [
                // --- Personal (all fields — no nulls) ---
                'nic'                      => '199012345075',
                'dob'                      => '1990-01-01',
                'title_id'                 => 'T02',
                'full_name'                => 'Arshvin Waduge',
                'gender_id'                => 'G01',
                'religion_id'              => 'R01',
                'ethnicity_id'             => 'E01',
                'civil_status_id'          => 'C02',
                'blood_group_id'           => 'B01',
                'email'                    => 'tarshvin@gmail.com',
                'phone'                    => '0772345678',
                'health_condition'         => '0',
                'health_problem'           => 'Mild asthma, managed with inhaler',
                // --- Permanent address ---
                'district_id'              => 'DIS001',
                'gn_division_id'           => 'GND00001',
                'address_line1'            => '123 Main Street',
                'address_line2'            => 'Colombo 07',
                'address_line3'            => 'Western Province',
                'postal_code'              => '10100',
                'latitude'                 => '6.9271',
                'longitude'                => '79.8612',
                // --- Temporary address ---
                't_address_line1'          => '456 Temple Lane',
                't_address_line2'          => 'Nugegoda',
                't_address_line3'          => 'Western Province',
                't_postal_code'            => '10250',
                // --- Appointment ---
                'first_appointment_date'   => '2015-06-01',
                'appointment_letter_no'    => 'SLTS/2015/003',
                'w_op_no'                  => 'WOP001236',
                'pay_sheet_no'             => 'PAY001236',
                // --- Teacher ---
                'teacher_category'         => 'TCAT0001',
                'teacher_type'             => 'TCHTYPE002',
                'appointment_medium'       => 'MED01',
                'appointment_subject'      => 'ASUB0020',  // Mathematics
                'main_subject'             => 'SUB0004',   // Mathematics
                'secondary_subject'        => 'SUB0021',   // ICT
                'current_teaching_subject' => 'SUB0004',   // Mathematics
                // --- Education ---
                'education'                => [
                    [
                        'qualifications_id' => 'EQ006',    // Bachelor's Degree
                        'institution'       => 'University of Colombo',
                        'effective_date'    => '2012-05-20',
                        'grade'             => 'GRD002',   // 2nd Upper Class
                        'description'       => 'BSc in Mathematics',
                    ],
                    [
                        'qualifications_id' => 'EQ007',    // Higher Diploma
                        'institution'       => 'National Institute of Education',
                        'effective_date'    => '2014-07-15',
                        'grade'             => 'GRD005',   // None
                        'description'       => 'Diploma in Education (Mathematics)',
                    ],
                ],
                // --- Family ---
                'family'                   => [
                    'spouse'        => [
                        'nic'              => '199345678901',
                        'dob'              => '1993-05-10',
                        'title_id'         => 'T01',
                        'full_name'        => 'Sanduni Kavindi Perera',
                        'gender_id'        => 'G02',
                        'religion_id'      => 'R01',
                        'ethnicity_id'     => 'E01',
                        'civil_status_id'  => 'C02',
                        'blood_group_id'   => 'B04',
                        'email'            => 'sanduni.kavindi@gmail.com',
                        'phone'            => '0702345678',
                        'health_condition' => '1',
                        'health_problem'   => 'None',
                        'district_id'      => 'DIS001',
                        'gn_division_id'   => 'GND00001',
                        'address_line1'    => '123 Main Street',
                        'address_line2'    => 'Colombo 07',
                        'address_line3'    => 'Western Province',
                        'postal_code'      => '10100',
                        'latitude'         => '6.9271',
                        'longitude'        => '79.8612',
                        't_address_line1'  => '123 Main Street',
                        't_address_line2'  => 'Colombo 07',
                        't_address_line3'  => 'Western Province',
                        't_postal_code'    => '10100',
                    ],
                    'married_date'  => '2017-08-20',
                    'married_cf_no' => 'MC2017002345',
                    'married_cf'    => 'none.pdf',
                    'family_name'   => 'Perera Family',
                    'children'      => [
                        [
                            'child_name'       => 'Kaviru Roshan Perera',
                            'date_of_birth'    => '2019-04-15',
                            'gender_id'        => 'G01',
                            'birth_fc_no'      => 'BC2019002345',
                            'health_condition' => true,
                        ],
                    ],
                ],
            ],
            [
                // --- Personal (all fields — no nulls) ---
                'nic'                      => '198667890123',
                'dob'                      => '1986-03-15',
                'title_id'                 => 'T01',
                'full_name'                => 'Nimali Sandya Silva',
                'gender_id'                => 'G02',
                'religion_id'              => 'R01',
                'ethnicity_id'             => 'E01',
                'civil_status_id'          => 'C02',
                'blood_group_id'           => 'B03',
                'email'                    => 'nimali.sandya@teacher.lk',
                'phone'                    => '0779876544',
                'health_condition'         => '1',
                'health_problem'           => 'None',
                // --- Permanent address ---
                'district_id'              => 'DIS002',
                'gn_division_id'           => 'GND00002',
                'address_line1'            => '45 Temple Road',
                'address_line2'            => 'Kandy',
                'address_line3'            => 'Central Province',
                'postal_code'              => '20000',
                'latitude'                 => '7.2906',
                'longitude'                => '80.6337',
                // --- Temporary address ---
                't_address_line1'          => '89 Peradeniya Road',
                't_address_line2'          => 'Kandy',
                't_address_line3'          => 'Central Province',
                't_postal_code'            => '20000',
                // --- Appointment ---
                'first_appointment_date'   => '2010-01-10',
                'appointment_letter_no'    => 'SLTS/2010/044',
                'w_op_no'                  => 'WOP002347',
                'pay_sheet_no'             => 'PAY002347',
                // --- Teacher ---
                'teacher_category'         => 'TCAT0002',
                'teacher_type'             => 'TCHTYPE003',
                'appointment_medium'       => 'MED01',
                'appointment_subject'      => 'ASUB0024',  // Science
                'main_subject'             => 'SUB0062',   // Science
                'secondary_subject'        => 'SUB0024',   // Health & Physical Education
                'current_teaching_subject' => 'SUB0062',   // Science
                // --- Education ---
                'education'                => [
                    [
                        'qualifications_id' => 'EQ006',    // Bachelor's Degree
                        'institution'       => 'University of Peradeniya',
                        'effective_date'    => '2007-12-10',
                        'grade'             => 'GRD001',   // 1st Class
                        'description'       => 'BSc in Biological Sciences',
                    ],
                    [
                        'qualifications_id' => 'EQ004',    // Postgraduate Diploma
                        'institution'       => 'University of Peradeniya',
                        'effective_date'    => '2009-06-30',
                        'grade'             => 'GRD005',   // None
                        'description'       => 'Postgraduate Diploma in Education',
                    ],
                ],
                // --- Family ---
                'family'                   => [
                    'spouse'        => [
                        'nic'              => '198345678902',
                        'dob'              => '1983-07-20',
                        'title_id'         => 'T02',
                        'full_name'        => 'Chaminda Nuwan Silva',
                        'gender_id'        => 'G01',
                        'religion_id'      => 'R01',
                        'ethnicity_id'     => 'E01',
                        'civil_status_id'  => 'C02',
                        'blood_group_id'   => 'B02',
                        'email'            => 'chaminda.nuwan@gmail.com',
                        'phone'            => '0756789013',
                        'health_condition' => '1',
                        'health_problem'   => 'None',
                        'district_id'      => 'DIS002',
                        'gn_division_id'   => 'GND00002',
                        'address_line1'    => '45 Temple Road',
                        'address_line2'    => 'Kandy',
                        'address_line3'    => 'Central Province',
                        'postal_code'      => '20000',
                        'latitude'         => '7.2906',
                        'longitude'        => '80.6337',
                        't_address_line1'  => '45 Temple Road',
                        't_address_line2'  => 'Kandy',
                        't_address_line3'  => 'Central Province',
                        't_postal_code'    => '20000',
                    ],
                    'married_date'  => '2008-06-15',
                    'married_cf_no' => 'MC2008002345',
                    'married_cf'    => 'none.pdf',
                    'family_name'   => 'Silva Family',
                    'children'      => [
                        [
                            'child_name'       => 'Dineth Chaminda Silva',
                            'date_of_birth'    => '2010-03-22',
                            'gender_id'        => 'G01',
                            'birth_fc_no'      => 'BC2010006789',
                            'health_condition' => true,
                        ],
                        [
                            'child_name'       => 'Sithara Nimali Silva',
                            'date_of_birth'    => '2013-09-05',
                            'gender_id'        => 'G02',
                            'birth_fc_no'      => 'BC2013010123',
                            'health_condition' => true,
                        ],
                    ],
                ],
            ],
        ];

        foreach ($teachers as $data) {
            DB::transaction(function () use ($data, $workplaceId) {
                $nic = NicHelper::normalize($data['nic']);

                $existingPeople = People::where('nic_hash', NicHelper::hash($nic))->first();

                // Skip only if both People AND Teacher already exist
                if ($existingPeople && $existingPeople->teacher()->exists()) {
                    return;
                }

                // 1. People — reuse existing or create new
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
                    'health_problem'     => $data['health_problem'],
                    'blood_group_id'     => $data['blood_group_id'],
                    'email'              => $data['email'],
                    'phone'              => $data['phone'],
                    'district_id'        => $data['district_id'],
                    'gn_division_id'     => $data['gn_division_id'],
                    'address_line1'      => $data['address_line1'],
                    'address_line2'      => $data['address_line2'],
                    'address_line3'      => $data['address_line3'],
                    'postal_code'        => $data['postal_code'],
                    'latitude'           => $data['latitude'],
                    'longitude'          => $data['longitude'],
                    't_address_line1'    => $data['t_address_line1'],
                    't_address_line2'    => $data['t_address_line2'],
                    't_address_line3'    => $data['t_address_line3'],
                    't_postal_code'      => $data['t_postal_code'],
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
                    'w_op_no'                => $data['w_op_no'],
                    'pay_sheet_no'           => $data['pay_sheet_no'],
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
                    'main_subject'             => $data['main_subject'],
                    'secondary_subject'        => $data['secondary_subject'],
                    'current_teaching_subject' => $data['current_teaching_subject'],
                ]);

                // 4. Current appointment
                EmployerCurrentAppointment::create([
                    'appointment_id'       => $appointmentId,
                    'employee_id'          => $people->people_id,
                    'appoint_date'         => $data['first_appointment_date'],
                    'appointment_letter_no' => $data['appointment_letter_no'],
                    'service_id'           => 'SER001',
                    'rank_id'              => 'RANK001',
                    'office_level_id'      => 'OLID006',
                    'position_id'          => 'POS001',
                    'workplace_id'         => $workplaceId,
                ]);

                // 5. Cadre subject
                EmployerCadreSubject::create([
                    'appointment_id'     => $appointmentId,
                    'employee_id'        => $people->people_id,
                    'appointment_medium' => $data['appointment_medium'],
                    'main_subject'       => $data['main_subject'],
                ]);

                // 6. Education qualifications
                foreach ($data['education'] as $edu) {
                    PeopleEducationQualification::create([
                        'people_id'         => $people->people_id,
                        'qualifications_id' => $edu['qualifications_id'],
                        'institution'       => $edu['institution'],
                        'effective_date'    => $edu['effective_date'],
                        'grade'             => $edu['grade'],
                        'description'       => $edu['description'],
                        'active_status'     => '1',
                    ]);
                }

                // 7. Spouse People record
                $familyData = $data['family'];
                $spouseData = $familyData['spouse'];
                $spouseNic  = NicHelper::normalize($spouseData['nic']);

                $spouse = People::create([
                    'nic'                => $spouseNic,
                    'title_id'           => $spouseData['title_id'],
                    'full_name'          => $spouseData['full_name'],
                    'name_with_initials' => People::generateInitials($spouseData['full_name']),
                    'gender_id'          => $spouseData['gender_id'],
                    'date_of_birth'      => $spouseData['dob'],
                    'religion_id'        => $spouseData['religion_id'],
                    'ethnicity_id'       => $spouseData['ethnicity_id'],
                    'civil_status_id'    => $spouseData['civil_status_id'],
                    'health_condition'   => $spouseData['health_condition'],
                    'health_problem'     => $spouseData['health_problem'],
                    'blood_group_id'     => $spouseData['blood_group_id'],
                    'email'              => $spouseData['email'],
                    'phone'              => $spouseData['phone'],
                    'district_id'        => $spouseData['district_id'],
                    'gn_division_id'     => $spouseData['gn_division_id'],
                    'address_line1'      => $spouseData['address_line1'],
                    'address_line2'      => $spouseData['address_line2'],
                    'address_line3'      => $spouseData['address_line3'],
                    'postal_code'        => $spouseData['postal_code'],
                    'latitude'           => $spouseData['latitude'],
                    'longitude'          => $spouseData['longitude'],
                    't_address_line1'    => $spouseData['t_address_line1'],
                    't_address_line2'    => $spouseData['t_address_line2'],
                    't_address_line3'    => $spouseData['t_address_line3'],
                    't_postal_code'      => $spouseData['t_postal_code'],
                    'profile_picture'    => 'default.png',
                    'active_status'      => '1',
                ]);

                // 8. Family record — member_a = husband (G01), member_b = wife (G02)
                $husbandId = $people->gender_id === 'G01' ? $people->people_id : $spouse->people_id;
                $wifeId    = $people->gender_id === 'G02' ? $people->people_id : $spouse->people_id;

                $family = Family::create([
                    'member_a_id'   => $husbandId,
                    'member_b_id'   => $wifeId,
                    'married_date'  => $familyData['married_date'],
                    'married_cf_no' => $familyData['married_cf_no'],
                    'married_cf'    => $familyData['married_cf'],
                    'family_name'   => $familyData['family_name'],
                    'active_status' => '1',
                ]);

                // 9. Children
                foreach ($familyData['children'] as $child) {
                    FamilyMember::create([
                        'family_id'        => $family->family_id,
                        'child_name'       => $child['child_name'],
                        'date_of_birth'    => $child['date_of_birth'],
                        'gender_id'        => $child['gender_id'],
                        'birth_fc_no'      => $child['birth_fc_no'],
                        'health_condition' => $child['health_condition'],
                        'active_status'    => '1',
                    ]);
                }

                // 10. System user
                $user = User::create([
                    'nic'                   => $nic,
                    'people_id'             => $people->people_id,
                    'name'                  => $people->name_with_initials,
                    'email'                 => $data['email'],
                    'contact'               => $data['phone'],
                    'password'              => 'User@' . $nic,
                    'identity_provider'     => 'local',
                    'must_change_password'  => true,
                ]);

                $user->assignRole('teacher');
            });
        }
    }
}
