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

class TeacherSeeder_03 extends Seeder
{
    public function run(Wso2IsProvisioningService $wso2Is): void
    {
        // Load one representative workplace per ZEO zone so teachers are spread
        // across different zones. Groups institution workplaces by zeo_wp_id and
        // picks the first workplace from each zone.
        $workplacesByZone = DB::table('workplaces as w')
            ->join('institutions as i', 'i.workplace_id', '=', 'w.workplace_id')
            ->where('w.office_level_id', 'OLID006')
            ->select('w.workplace_id', 'i.zeo_wp_id')
            ->get()
            ->groupBy('zeo_wp_id')
            ->map(fn ($group) => $group->first()->workplace_id)
            ->values()
            ->toArray();

        if (empty($workplacesByZone)) {
            $this->command->error('No institution workplaces found. Run institution seeders first.');
            return;
        }

        $zoneCount = count($workplacesByZone);
        $this->command->info("Found {$zoneCount} zones — distributing teachers across all zones.");

        // [full_name, gender_id, religion_id, ethnicity_id, birth_year]
        $namePool = [
            // --- Sinhala Male (30) ---
            ['Kamal Perera',           'G01', 'R01', 'E01', 1982],
            ['Nimal Silva',            'G01', 'R01', 'E01', 1978],
            ['Sunil Fernando',         'G01', 'R01', 'E01', 1985],
            ['Saman Wickramasinghe',   'G01', 'R01', 'E01', 1980],
            ['Asanka Rajapaksha',      'G01', 'R01', 'E01', 1988],
            ['Chaminda Dissanayake',   'G01', 'R01', 'E01', 1975],
            ['Nuwan Jayawardena',      'G01', 'R01', 'E01', 1990],
            ['Thilina Bandara',        'G01', 'R01', 'E01', 1983],
            ['Sampath Senanayake',     'G01', 'R01', 'E01', 1977],
            ['Buddhika Rathnayake',    'G01', 'R01', 'E01', 1986],
            ['Prasad Herath',          'G01', 'R01', 'E01', 1979],
            ['Chathura Gunasekara',    'G01', 'R01', 'E01', 1992],
            ['Dilshan Wijesekara',     'G01', 'R01', 'E01', 1984],
            ['Danushka Gunawardena',   'G01', 'R01', 'E01', 1981],
            ['Gayan Kumara',           'G01', 'R01', 'E01', 1989],
            ['Randika Pathirana',      'G01', 'R01', 'E01', 1987],
            ['Isuru Senevirathne',     'G01', 'R01', 'E01', 1993],
            ['Harsha Madusanka',       'G01', 'R01', 'E01', 1976],
            ['Lahiru Liyanage',        'G01', 'R01', 'E01', 1991],
            ['Ruwan Amarasinghe',      'G01', 'R01', 'E01', 1984],
            ['Dimuthu Weerasinghe',    'G01', 'R01', 'E01', 1982],
            ['Sajith Koswatta',        'G01', 'R01', 'E01', 1978],
            ['Malinga Balasuriya',     'G01', 'R01', 'E01', 1985],
            ['Tharindu Aluthge',       'G01', 'R01', 'E01', 1990],
            ['Sanjeewa Ranasinghe',    'G01', 'R01', 'E01', 1980],
            ['Dilan Rodrigo',          'G01', 'R03', 'E01', 1977],
            ['Supun Kumarasinghe',     'G01', 'R01', 'E01', 1988],
            ['Ishan Jayasekara',       'G01', 'R01', 'E01', 1994],
            ['Kasun Abeysekara',       'G01', 'R01', 'E01', 1983],
            ['Vimukthi Amaratunge',    'G01', 'R01', 'E01', 1987],
            // --- Sinhala Female (30) ---
            ['Nimali Perera',          'G02', 'R01', 'E01', 1982],
            ['Sandya Silva',           'G02', 'R01', 'E01', 1979],
            ['Kumari Fernando',        'G02', 'R01', 'E01', 1985],
            ['Malathi Wickramasinghe', 'G02', 'R01', 'E01', 1977],
            ['Dilhani Rajapaksha',     'G02', 'R01', 'E01', 1988],
            ['Anusha Dissanayake',     'G02', 'R01', 'E01', 1975],
            ['Chamari Jayawardena',    'G02', 'R01', 'E01', 1991],
            ['Roshani Bandara',        'G02', 'R01', 'E01', 1983],
            ['Nadeesha Senanayake',    'G02', 'R01', 'E01', 1978],
            ['Hiruni Rathnayake',      'G02', 'R01', 'E01', 1986],
            ['Chandima Herath',        'G02', 'R01', 'E01', 1980],
            ['Tharindi Gunasekara',    'G02', 'R01', 'E01', 1992],
            ['Sachini Wijesekara',     'G02', 'R01', 'E01', 1984],
            ['Sithara Gunawardena',    'G02', 'R01', 'E01', 1981],
            ['Manisha Kumara',         'G02', 'R01', 'E01', 1989],
            ['Dilrukshi Pathirana',    'G02', 'R01', 'E01', 1987],
            ['Gayathri Senevirathne',  'G02', 'R01', 'E01', 1993],
            ['Thilini Madusanka',      'G02', 'R01', 'E01', 1976],
            ['Menaka Liyanage',        'G02', 'R01', 'E01', 1990],
            ['Upeksha Amarasinghe',    'G02', 'R01', 'E01', 1984],
            ['Pavithra Weerasinghe',   'G02', 'R01', 'E01', 1982],
            ['Shalini Koswatta',       'G02', 'R03', 'E01', 1979],
            ['Amoda Balasuriya',       'G02', 'R01', 'E01', 1985],
            ['Janani Aluthge',         'G02', 'R01', 'E01', 1995],
            ['Keshani Ranasinghe',     'G02', 'R01', 'E01', 1980],
            ['Dulani Rodrigo',         'G02', 'R03', 'E01', 1977],
            ['Ishara Kumarasinghe',    'G02', 'R01', 'E01', 1988],
            ['Nayomi Jayasekara',      'G02', 'R01', 'E01', 1994],
            ['Waruni Abeysekara',      'G02', 'R01', 'E01', 1983],
            ['Madhuri Abeywickrama',   'G02', 'R01', 'E01', 1986],
            // --- Tamil Male (10) ---
            ['Suresh Rajendran',       'G01', 'R02', 'E02', 1980],
            ['Rajesh Krishnamoorthi',  'G01', 'R02', 'E02', 1985],
            ['Vijay Selvarajah',       'G01', 'R02', 'E02', 1978],
            ['Kumar Sooriyakumar',     'G01', 'R02', 'E02', 1982],
            ['Murugan Murugesan',      'G01', 'R02', 'E02', 1975],
            ['Arjun Sivakumar',        'G01', 'R02', 'E02', 1990],
            ['Karthik Balendran',      'G01', 'R02', 'E02', 1987],
            ['Pradeep Navaratnam',     'G01', 'R02', 'E02', 1983],
            ['Rajan Thambipillai',     'G01', 'R02', 'E02', 1979],
            ['Selvam Kandiah',         'G01', 'R02', 'E02', 1992],
            // --- Tamil Female (10) ---
            ['Priya Rajendran',        'G02', 'R02', 'E02', 1984],
            ['Kavitha Krishnamoorthi', 'G02', 'R02', 'E02', 1981],
            ['Nithya Selvarajah',      'G02', 'R02', 'E02', 1988],
            ['Divya Sooriyakumar',     'G02', 'R02', 'E02', 1986],
            ['Lakshmi Murugesan',      'G02', 'R02', 'E02', 1979],
            ['Suganya Sivakumar',      'G02', 'R02', 'E02', 1991],
            ['Anitha Balendran',       'G02', 'R02', 'E02', 1977],
            ['Meena Navaratnam',       'G02', 'R02', 'E02', 1985],
            ['Deepa Thambipillai',     'G02', 'R02', 'E02', 1983],
            ['Thilaga Kandiah',        'G02', 'R02', 'E02', 1993],
            // --- Muslim Male (8) ---
            ['Mohamed Cassim',         'G01', 'R04', 'E03', 1981],
            ['Hassan Razik',           'G01', 'R04', 'E03', 1985],
            ['Ibrahim Nazar',          'G01', 'R04', 'E03', 1978],
            ['Abdul Hameed',           'G01', 'R04', 'E03', 1990],
            ['Nizam Saleem',           'G01', 'R04', 'E03', 1983],
            ['Fairooz Farook',         'G01', 'R04', 'E03', 1976],
            ['Rifaz Latiff',           'G01', 'R04', 'E03', 1988],
            ['Shafraz Mohideen',       'G01', 'R04', 'E03', 1994],
            // --- Muslim Female (7) ---
            ['Fathima Cassim',         'G02', 'R04', 'E03', 1982],
            ['Ayesha Razik',           'G02', 'R04', 'E03', 1986],
            ['Rifka Nazar',            'G02', 'R04', 'E03', 1989],
            ['Shahira Hameed',         'G02', 'R04', 'E03', 1984],
            ['Nasrin Saleem',          'G02', 'R04', 'E03', 1977],
            ['Zainab Farook',          'G02', 'R04', 'E03', 1991],
            ['Hafeeza Latiff',         'G02', 'R04', 'E03', 1980],
            // --- Additional Sinhala (5) ---
            ['Sachin Jayaratne',       'G01', 'R01', 'E01', 1992],
            ['Malaka Wijesinghe',      'G01', 'R01', 'E01', 1984],
            ['Iresha Tennakoon',       'G02', 'R01', 'E01', 1989],
            ['Ruwani Weerakoon',       'G02', 'R01', 'E01', 1985],
            ['Lasith Pradeep',         'G01', 'R01', 'E01', 1995],
        ];

        $addresses = [
            ['123 Main Street',    'Colombo 07',  'Western Province',          '10700'],
            ['45 Temple Road',     'Kandy',        'Central Province',          '20000'],
            ['78 Station Road',    'Gampaha',      'Western Province',          '11000'],
            ['22 Lake View',       'Kalutara',     'Western Province',          '12000'],
            ['56 Hill Street',     'Matale',       'Central Province',          '21000'],
            ['90 Beach Road',      'Galle',        'Southern Province',         '80000'],
            ['34 Garden Lane',     'Matara',       'Southern Province',         '81000'],
            ['67 Market Street',   'Negombo',      'Western Province',          '11500'],
            ['15 River Road',      'Ratnapura',    'Sabaragamuwa Province',     '70000'],
            ['29 Forest Avenue',   'Kurunegala',   'North Western Province',    '60000'],
            ['11 Peradeniya Road', 'Peradeniya',   'Central Province',          '20400'],
            ['88 Galle Road',      'Ambalangoda',  'Southern Province',         '80300'],
        ];

        $districts   = ['DIS001', 'DIS002', 'DIS003', 'DIS004', 'DIS005', 'DIS007', 'DIS010', 'DIS011', 'DIS013'];
        $gnDivisions = ['GND00001', 'GND00002', 'GND00003', 'GND00004', 'GND00005'];
        $bloodGroups = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08'];
        $civilStatuses     = ['C01', 'C02'];
        $teacherCategories = ['TCAT0001', 'TCAT0002', 'TCAT0003'];
        $teacherTypes      = ['TCHTYPE001', 'TCHTYPE002', 'TCHTYPE003'];
        $mediums           = ['MED01', 'MED02'];

        // [appointment_subject, main_subject, secondary_subject]
        $subjects = [
            ['ASUB0020', 'SUB0004', 'SUB0021'],  // Mathematics / ICT
            ['ASUB0024', 'SUB0062', 'SUB0024'],  // Science / Health & PE
            ['ASUB0001', 'SUB0001', 'SUB0004'],  // Sinhala / Mathematics
        ];

        // Verification status distribution across 100 teachers:
        //   0–34  (35) → pending verification  (is_verified=0, is_confirmed=0)
        //  35–64  (30) → pending confirmation  (is_verified=1, is_confirmed=0)
        //  65–84  (20) → rejected              (is_verified=2, is_confirmed=0)
        //  85–99  (15) → confirmed             (is_verified=1, is_confirmed=1)
        $statusMap = static function (int $index): array {
            if ($index < 35) {
                return [0, 0]; // pending verification
            }
            if ($index < 65) {
                return [1, 0]; // pending confirmation
            }
            if ($index < 85) {
                return [2, 0]; // rejected
            }
            return [1, 1];    // confirmed
        };

        $created = 0;
        $skipped = 0;

        foreach ($namePool as $index => [$fullName, $genderId, $religionId, $ethnicityId, $birthYear]) {
            DB::transaction(function () use (
                $index, $fullName, $genderId, $religionId, $ethnicityId, $birthYear,
                $workplacesByZone, $zoneCount, $addresses, $districts, $gnDivisions,
                $bloodGroups, $civilStatuses, $teacherCategories, $teacherTypes,
                $mediums, $subjects, $statusMap,
                &$created, &$skipped, $wso2Is
            ) {
                // NIC: YYYY + day-of-year (female = day+500) + 5-digit unique index
                $nicDay = ($genderId === 'G02' ? 500 : 0) + 100 + ($index % 200);
                $nic    = NicHelper::normalize(sprintf('%04d%03d%05d', $birthYear, $nicDay, $index + 1));

                if (People::where('nic_hash', NicHelper::hash($nic))->exists()) {
                    $skipped++;
                    return;
                }

                // Cycle through zones so each zone gets roughly equal coverage
                $workplaceId = $workplacesByZone[$index % $zoneCount];

                $titleId       = $genderId === 'G01' ? 'T02' : 'T01';
                $dob           = sprintf('%04d-%02d-%02d', $birthYear, ($index % 11) + 1, ($index % 27) + 1);
                $email         = sprintf('teacher.seed%03d@emis.edu.lk', $index + 1);
                $phone         = sprintf('077%07d', 2000000 + $index);
                $addressData   = $addresses[$index % count($addresses)];
                $districtId    = $districts[$index % count($districts)];
                $gnDivisionId  = $gnDivisions[$index % count($gnDivisions)];
                $bloodGroupId  = $bloodGroups[$index % count($bloodGroups)];
                $civilStatusId = $civilStatuses[$index % 2];
                $category      = $teacherCategories[$index % count($teacherCategories)];
                $type          = $teacherTypes[$index % count($teacherTypes)];
                $medium        = $mediums[$index % count($mediums)];
                $subject       = $subjects[$index % count($subjects)];

                // Spread appointment years 2005–2020
                $appointYear  = 2005 + ($index % 16);
                $appointMonth = ($index % 11) + 1;
                $appointDate  = sprintf('%04d-%02d-01', $appointYear, $appointMonth);

                [$isVerified, $isConfirmed] = $statusMap($index);

                // 1. People
                $people = People::create([
                    'nic'                => $nic,
                    'title_id'           => $titleId,
                    'full_name'          => $fullName,
                    'name_with_initials' => People::generateInitials($fullName),
                    'gender_id'          => $genderId,
                    'date_of_birth'      => $dob,
                    'religion_id'        => $religionId,
                    'ethnicity_id'       => $ethnicityId,
                    'civil_status_id'    => $civilStatusId,
                    'health_condition'   => '1',
                    'blood_group_id'     => $bloodGroupId,
                    'email'              => $email,
                    'phone'              => $phone,
                    'district_id'        => $districtId,
                    'gn_division_id'     => $gnDivisionId,
                    'address_line1'      => $addressData[0],
                    'address_line2'      => $addressData[1],
                    'address_line3'      => $addressData[2],
                    'postal_code'        => $addressData[3],
                    'profile_picture'    => 'default.png',
                    'active_status'      => '1',
                ]);

                // 2. First appointment
                $retirementDate = Carbon::parse($dob)->addYears(55)->toDateString();
                $appointmentId  = EmployerAppointment::generateAppointmentId($appointDate);

                EmployerAppointment::create([
                    'appointment_id'         => $appointmentId,
                    'employee_id'            => $people->people_id,
                    'first_appointment_date' => $appointDate,
                    'retirement_date'        => $retirementDate,
                    'service_id'             => 'SER001',
                    'rank_id'                => 'RANK001',
                    'position_id'            => 'POS001',
                    'office_level_id'        => 'OLID006',
                    'workplace_id'           => $workplaceId,
                    'appointment_letter_no'  => sprintf('SLTS/T03/%04d', $index + 1),
                    'appointment_letter'     => 'none.pdf',
                    'is_verified'            => $isVerified,
                    'is_confirmed'           => $isConfirmed,
                    'active_status'          => '1',
                ]);

                // 3. Teacher
                Teacher::create([
                    'appointment_id'           => $appointmentId,
                    'employee_id'              => $people->people_id,
                    'teacher_category'         => $category,
                    'teacher_type'             => $type,
                    'appointment_medium'       => $medium,
                    'appointment_subject'      => $subject[0],
                    'main_subject'             => $subject[1],
                    'secondary_subject'        => $subject[2],
                    'current_teaching_subject' => $subject[1],
                ]);

                // 4. Current appointment
                EmployerCurrentAppointment::create([
                    'appointment_id'  => $appointmentId,
                    'employee_id'     => $people->people_id,
                    'appoint_date'    => $appointDate,
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
                    'email'     => $email,
                    'contact'   => $phone,
                    'password'  => 'Password@123',
                ]);

                $user->assignRole('teacher');

                $result = $wso2Is->provisionUser($user, 'Password@123', 'teacher');
                if ($result['provisioned'] ?? false) {
                    $this->command->info("  WSO2: provisioned {$email}");
                } else {
                    $reason = $result['error'] ?? ($result['skipped'] ?? false ? 'WSO2 disabled' : 'unknown');
                    $this->command->warn("  WSO2 provisioning failed for {$email}: {$reason}");
                }

                $created++;
            });
        }

        $this->command->info("TeacherSeeder_03 complete: {$created} created, {$skipped} skipped.");
        $this->command->info('Verification breakdown: 35 pending verification, 30 pending confirmation, 20 rejected, 15 confirmed.');
    }
}
