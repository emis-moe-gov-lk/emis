<?php

namespace Database\Seeders;

use App\Helpers\NicHelper;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * High-performance seeder: 10 000 teachers with full profiles.
 *
 * Strategy: bypass Eloquent entirely (no model events, no activity logging,
 * no cross-sync hooks, no per-row role assignment).  IDs are pre-generated
 * in memory from a single DB query each, then rows are buffered and flushed
 * in BATCH-sized bulk inserts.  Roles are assigned in one INSERT…SELECT at
 * the very end.
 */
class BulkTeacherSeeder extends Seeder
{
    private const TOTAL = 10_000;
    private const BATCH = 500;   // rows per INSERT statement

    // ── Name pools ────────────────────────────────────────────────────────

    private const SINH_M = [
        'Nuwan','Kasun','Chathura','Rukshan','Malith','Thilina','Chamara',
        'Dilshan','Saman','Pradeep','Madusanka','Isuru','Lahiru','Sachith',
        'Dimuthu','Supun','Tharaka','Gayan','Pasan','Randika','Danushka',
        'Kavishka','Hirantha','Udara','Oshadha','Amila','Dilan','Eranda',
        'Prasad','Sanjeewa',
    ];
    private const SINH_F = [
        'Dilrukshi','Sandya','Nirasha','Kumari','Chamari','Nadeeka','Thilini',
        'Ishara','Lakmali','Kavindi','Sachini','Dulani','Hasini','Madara',
        'Senali','Oshadi','Harshani','Nethmini','Viduni','Sithara','Kavya',
        'Amaya','Dinusha','Hiruni','Piyumi','Rashmi','Samadhi','Thisari',
        'Udari','Nimasha',
    ];
    private const SINH_S = [
        'Perera','Silva','Fernando','De Silva','Rajapaksa','Dissanayake',
        'Senanayake','Jayawardena','Wickramasinghe','Gunawardena','Bandara',
        'Pathirana','Seneviratne','Rathnayake','Karunarathne','Wijesinghe',
        'Mendis','Amarasinghe','Gamage','Edirisinghe','Jayathilaka',
        'Kumarasinghe','Herath','Weerasinghe','Samarawickrama','Liyanage',
        'Ranasinghe','Weerakoon','Jayasuriya','Nanayakkara',
    ];

    private const TAMIL_M = [
        'Arjunan','Selvam','Murugan','Rajan','Kumar','Suresh','Vijay',
        'Ganesh','Ramesh','Shankar','Pradeep','Jeyaraj','Thileeban',
        'Sivakumar','Nithyanandam','Balakumar','Chandran','Dharmaraj',
        'Elangovan','Ganeshan',
    ];
    private const TAMIL_F = [
        'Priya','Kavitha','Anita','Shanthi','Meena','Usha','Lalitha',
        'Geetha','Nirmala','Saranya','Vithya','Thilaga','Kumari','Selvi',
        'Suganthi','Abarna','Bavani','Devika','Indira','Janani',
    ];
    private const TAMIL_S = [
        'Selvarajah','Sivakumar','Rajanayagam','Balakrishnan','Ponnambalam',
        'Ratinam','Subramaniam','Nadarajah','Arulampalam','Yogarasa',
        'Sathiyamohan','Kanagasabai','Velayutham','Arunasalam','Coomaraswamy',
    ];

    private const MUSLIM_M = [
        'Mohamed','Ahamed','Ibrahim','Hassan','Hussain','Ismail','Farook',
        'Rasheed','Nazeer','Sameer','Riyaz','Shakeel','Fazeel','Farhan',
        'Nizar','Adil','Dawood','Farid','Gaffar','Hakeem',
    ];
    private const MUSLIM_F = [
        'Fathima','Ayesha','Zainab','Hasna','Rumaisa','Nusrath','Zuhra',
        'Firthous','Sabra','Maryam','Amina','Bushra','Eeshal','Farida','Gulshan',
    ];
    private const MUSLIM_S = [
        'Aziz','Bakeer','Farouk','Hussain','Ismail','Jabbar','Razeen',
        'Shaheed','Thawfeer','Ummar','Rishad','Lafir','Marikar','Naleemi','Ossen',
    ];

    private const STREETS = [
        'Main Street','Temple Road','School Lane','Lake Road','Station Road',
        'Church Street','Market Road','Garden Path','Hill Street','River Road',
        'Galle Road','Kandy Road','Flower Road','Baudhaloka Mawatha','Rajapihilla Mawatha',
    ];
    private const UNIS = [
        'University of Colombo','University of Peradeniya','University of Kelaniya',
        'University of Sri Jayewardenepura','University of Moratuwa','University of Ruhuna',
        'Eastern University','Rajarata University','Sabaragamuwa University',
        'Open University of Sri Lanka','National Institute of Education',
        'University of Jaffna','South Eastern University','Wayamba University',
    ];
    private const CHILD_NAMES = [
        'Sathya','Dineth','Nethmi','Ashan','Avindi','Chanuka','Dewmi',
        'Ehara','Fathiha','Gihan','Hasith','Imasha','Janith','Kaviru','Lithira',
        'Maheli','Navodi','Omesh','Pavithra','Ravindu',
    ];
    private const DISTRICT_CITIES = [
        'DIS001'=>'Colombo','DIS002'=>'Kandy','DIS003'=>'Galle','DIS004'=>'Jaffna',
        'DIS005'=>'Kurunegala','DIS006'=>'Ratnapura','DIS007'=>'Anuradhapura',
        'DIS008'=>'Badulla','DIS009'=>'Matara','DIS010'=>'Trincomalee',
        'DIS011'=>'Batticaloa','DIS012'=>'Ampara','DIS013'=>'Polonnaruwa',
        'DIS014'=>'Mannar','DIS015'=>'Vavuniya','DIS016'=>'Mullaitivu',
        'DIS017'=>'Kilinochchi','DIS018'=>'Puttalam','DIS019'=>'Hambantota',
        'DIS020'=>'Monaragala','DIS021'=>'Kegalle','DIS022'=>'Nuwara Eliya',
        'DIS023'=>'Matale','DIS024'=>'Kalutara','DIS025'=>'Gampaha',
    ];

    // ─────────────────────────────────────────────────────────────────────
    public function run(): void
    {
        // ── Lookup arrays (loaded once, accessed by modulo index) ─────────
        $workplaceIds   = DB::table('workplaces')->where('office_level_id', 'OLID006')
                            ->pluck('workplace_id')->toArray();
        $subjectIds     = DB::table('subject_lists')->where('active_status', 1)
                            ->pluck('subject_id')->toArray();
        $apptSubjectIds = DB::table('apointed_subjects')->pluck('a_subject_id')->toArray();
        $districtIds    = DB::table('districts_lists')->pluck('district_id')->toArray();
        $gnDivisionIds  = DB::table('gn_divisions')->pluck('gn_division_id')->toArray();

        if (empty($workplaceIds)) {
            $this->command->error('No school workplaces (office_level_id=OLID006). Run institution seeders first.');
            return;
        }
        if (empty($subjectIds) || empty($apptSubjectIds)) {
            $this->command->error('Subject tables empty. Run SubjectSeeder / AppointedSubjectsSeeder first.');
            return;
        }

        $teacherRoleId = DB::table('roles')->where('name', 'teacher')->value('id');
        if (! $teacherRoleId) {
            $this->command->error("Role 'teacher' not found. Run RolePermissionSeeder first.");
            return;
        }

        // ── Pre-generate ID sequences (1 query each, then increment in RAM) ─
        $yr        = now()->format('y');  // e.g. '26'
        $peopleSeq = $this->lastSeq('people',                 'people_id',      "PE{$yr}%");
        $apptSeq   = $this->lastSeq('employer_appointments',  'appointment_id', "AP{$yr}%");
        $familySeq = $this->lastSeq('families',               'family_id',      "FA{$yr}%");

        // ── Shared constants ──────────────────────────────────────────────
        $hashedPw  = Hash::make('password@123');
        $now       = now()->toDateTimeString();
        $qualPool  = ['EQ004', 'EQ005', 'EQ006', 'EQ007', 'EQ008'];

        $wLen = count($workplaceIds);
        $sLen = count($subjectIds);
        $aLen = count($apptSubjectIds);
        $dLen = count($districtIds);
        $gLen = count($gnDivisionIds);

        $this->command->info(sprintf(
            'Workplaces: %d  |  Subjects: %d  |  Seeding %s teachers in batches of %d…',
            $wLen, $sLen, number_format(self::TOTAL), self::BATCH
        ));

        $bar = $this->command->getOutput()->createProgressBar(self::TOTAL);
        $bar->start();

        // ── Batch buffers ──────────────────────────────────────────────────
        $peopleBuf  = []; $spouseBuf  = []; $apptBuf    = [];
        $teacherBuf = []; $currBuf    = []; $qualBuf    = [];
        $familyBuf  = []; $memberBuf  = []; $userBuf    = [];

        for ($seq = 1; $seq <= self::TOTAL; $seq++) {
            // ── Demographics ─────────────────────────────────────────────
            $isFemale  = ($seq % 2 === 0);
            $gender    = $isFemale ? 'G02' : 'G01';
            $roll      = $seq % 20;
            $ethnicity = $roll < 14 ? 'E01' : ($roll < 17 ? 'E02' : 'E04');

            [$fullName, $title] = $this->buildName($seq, $isFemale, $ethnicity);
            $initials = $this->initials($fullName);

            // ── DOB & valid 12-digit NIC ──────────────────────────────────
            // 25 birth-years × 300 day slots = 7 500 unique (year,day) combos;
            // serial flips 1→2 after 7 500, so all 10 000 NICs are distinct.
            $slot      = $seq - 1;
            $birthYear = 1965 + ($slot % 25);
            $dayGroup  = (int) ($slot / 25);
            $dayOfYear = ($dayGroup % 300) + 1;   // 1 – 300
            $serial    = (int) ($dayGroup / 300) + 1;  // 1 or 2
            $nicDay    = $isFemale ? $dayOfYear + 500 : $dayOfYear;
            $nic       = NicHelper::normalize(sprintf('%04d%03d0%04d', $birthYear, $nicDay, $serial));
            $nicHash   = NicHelper::hash($nic);
            $dob       = Carbon::createFromFormat('Y z', $birthYear . ' ' . ($dayOfYear - 1))
                            ->format('Y-m-d');

            // ── Contact / location ────────────────────────────────────────
            $email      = "teacher{$seq}@emis.school.lk";
            $phone      = sprintf('07%08d', $seq);            // unique per seq
            $districtId = $districtIds[$seq % $dLen];
            $gnDivId    = $gnDivisionIds[$seq % $gLen];
            $city       = self::DISTRICT_CITIES[$districtId] ?? 'Sri Lanka';
            $street     = self::STREETS[$seq % count(self::STREETS)];
            $postal     = str_pad(10000 + ($seq % 89999), 5, '0', STR_PAD_LEFT);

            $civilStatus = match ($seq % 10) {
                0, 1, 2 => 'C01',
                8       => 'C03',
                9       => 'C04',
                default => 'C02',
            };
            $religion = match ($ethnicity) {
                'E02'   => 'R02',
                'E04'   => 'R03',
                default => 'R01',
            };
            $medium    = ($ethnicity === 'E01') ? 'MED01' : 'MED02';
            $blood     = 'B' . str_pad(($seq % 8) + 1, 2, '0', STR_PAD_LEFT);

            // ── Generate IDs in RAM (no DB round-trip) ────────────────────
            $peopleSeq++;
            $peopleId = "PE{$yr}" . str_pad($peopleSeq, 8, '0', STR_PAD_LEFT);

            $apptYear  = 1995 + ($seq % 26);
            $apptDate  = Carbon::create($apptYear, ($seq % 12) + 1, ($seq % 20) + 1)->format('Y-m-d');
            $apptSeq++;
            $appointmentId  = "AP{$yr}" . str_pad($apptSeq, 8, '0', STR_PAD_LEFT);
            $retirementDate = Carbon::parse($dob)->addYears(60)->format('Y-m-d');

            $workplaceId  = $workplaceIds[$seq % $wLen];
            $subjectId    = $subjectIds[$seq % $sLen];
            $apptSubId    = $apptSubjectIds[$seq % $aLen];
            $rankId       = 'RANK00'   . (($seq % 3) + 1);
            $typeId       = 'TCHTYPE00' . (($seq % 5) + 1);
            $catId        = 'TCAT000'  . (($seq % 5) + 1);
            $letterNo     = 'SLTS/' . $apptYear . '/' . str_pad($seq, 5, '0', STR_PAD_LEFT);

            // ── Build rows ────────────────────────────────────────────────
            $peopleBuf[] = [
                'people_id'          => $peopleId,
                'nic'                => Crypt::encryptString($nic),
                'nic_hash'           => $nicHash,
                'title_id'           => $title,
                'full_name'          => Crypt::encryptString($fullName),
                'name_with_initials' => Crypt::encryptString($initials),
                'gender_id'          => $gender,
                'date_of_birth'      => $dob,
                'religion_id'        => $religion,
                'ethnicity_id'       => $ethnicity,
                'civil_status_id'    => $civilStatus,
                'health_condition'   => 1,
                'blood_group_id'     => $blood,
                'email'              => $email,
                'phone'              => $phone,
                'district_id'        => $districtId,
                'gn_division_id'     => $gnDivId,
                'address_line1'      => ($seq % 500 + 1) . ' ' . $street,
                'address_line2'      => $city,
                'postal_code'        => $postal,
                'profile_picture'    => 'default.png',
                'active_status'      => 1,
                'created_at'         => $now,
                'updated_at'         => $now,
            ];

            $apptBuf[] = [
                'appointment_id'         => $appointmentId,
                'employee_id'            => $peopleId,
                'first_appointment_date' => $apptDate,
                'retirement_date'        => $retirementDate,
                'service_id'             => 'SER001',
                'rank_id'                => $rankId,
                'position_id'            => 'POS001',
                'office_level_id'        => 'OLID006',
                'workplace_id'           => $workplaceId,
                'appointment_letter_no'  => $letterNo,
                'appointment_letter'     => 'none.pdf',
                'active_status'          => 1,
                'created_at'             => $now,
                'updated_at'             => $now,
            ];

            $teacherBuf[] = [
                'appointment_id'           => $appointmentId,
                'employee_id'              => $peopleId,
                'teacher_category'         => $catId,
                'teacher_type'             => $typeId,
                'appointment_medium'       => $medium,
                'appointment_subject'      => $apptSubId,
                'main_subject'             => $subjectId,
                'current_teaching_subject' => $subjectId,
                'created_at'               => $now,
                'updated_at'               => $now,
            ];

            $currBuf[] = [
                'appointment_id'  => $appointmentId,
                'employee_id'     => $peopleId,
                'appoint_date'    => $apptDate,
                'service_id'      => 'SER001',
                'rank_id'         => $rankId,
                'office_level_id' => 'OLID006',
                'position_id'     => 'POS001',
                'workplace_id'    => $workplaceId,
                'created_at'      => $now,
                'updated_at'      => $now,
            ];

            // Education qualifications (1-2 per teacher)
            $used = [];
            for ($q = 0, $max = ($seq % 2) + 1; $q < $max; $q++) {
                $qId = $qualPool[($seq + $q) % 5];
                if (in_array($qId, $used)) {
                    continue;
                }
                $used[] = $qId;
                $qualBuf[] = [
                    'people_id'        => $peopleId,
                    'qualifications_id' => $qId,
                    'institution'      => self::UNIS[($seq + $q) % count(self::UNIS)],
                    'effective_date'   => Carbon::create($birthYear + 22 + $q, 6, 1)->format('Y-m-d'),
                    'grade'            => 'GRD' . str_pad(($seq % 4) + 2, 3, '0', STR_PAD_LEFT),
                    'active_status'    => 1,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];
            }

            $userBuf[] = [
                'nic'             => Crypt::encryptString($nic),
                'nic_hash'        => $nicHash,
                'people_id'       => $peopleId,
                'name'            => Crypt::encryptString($initials),
                'email'           => $email,
                'contact'         => $phone,
                'password'        => $hashedPw,
                'profile_picture' => 'default.png',
                'active_status'   => 1,
                'created_at'      => $now,
                'updated_at'      => $now,
            ];

            // ── Family (married teachers only) ────────────────────────────
            if ($civilStatus === 'C02') {
                // Spouse People ID
                $peopleSeq++;
                $spouseId = "PE{$yr}" . str_pad($peopleSeq, 8, '0', STR_PAD_LEFT);

                $spouseIsFemale = ! $isFemale;
                $spouseGender   = $spouseIsFemale ? 'G02' : 'G01';
                [$spouseName, $spouseTitle] = $this->buildName($seq + 500_000, $spouseIsFemale, $ethnicity);

                // Spouse NIC serial is always in 5001-9999 range → never clashes with teacher serial (1-2)
                $spouseNicDay = $spouseIsFemale ? $dayOfYear + 500 : $dayOfYear;
                $spouseSerial = ($seq % 4999) + 5000;
                $spouseNic    = NicHelper::normalize(sprintf('%04d%03d0%04d', $birthYear, $spouseNicDay, $spouseSerial));

                $spouseBuf[] = [
                    'people_id'          => $spouseId,
                    'nic'                => Crypt::encryptString($spouseNic),
                    'nic_hash'           => NicHelper::hash($spouseNic),
                    'title_id'           => $spouseTitle,
                    'full_name'          => Crypt::encryptString($spouseName),
                    'name_with_initials' => Crypt::encryptString($this->initials($spouseName)),
                    'gender_id'          => $spouseGender,
                    'date_of_birth'      => Carbon::parse($dob)->subYears(($seq % 4) + 1)->format('Y-m-d'),
                    'religion_id'        => $religion,
                    'ethnicity_id'       => $ethnicity,
                    'civil_status_id'    => 'C02',
                    'health_condition'   => 1,
                    'blood_group_id'     => 'B' . str_pad((($seq + 3) % 8) + 1, 2, '0', STR_PAD_LEFT),
                    'email'              => "spouse{$seq}@emis.school.lk",
                    'phone'              => sprintf('07%08d', 20_000 + $seq),
                    'district_id'        => $districtId,
                    'gn_division_id'     => $gnDivId,
                    'address_line1'      => ($seq % 500 + 1) . ' ' . $street,
                    'address_line2'      => $city,
                    'postal_code'        => $postal,
                    'profile_picture'    => 'default.png',
                    'active_status'      => 1,
                    'created_at'         => $now,
                    'updated_at'         => $now,
                ];

                // Family record
                $familySeq++;
                $familyId    = "FA{$yr}" . str_pad($familySeq, 8, '0', STR_PAD_LEFT);
                $marriedDate = Carbon::parse($dob)->addYears(26)->format('Y-m-d');
                [$memberA, $memberB] = $isFemale
                    ? [$spouseId, $peopleId]
                    : [$peopleId, $spouseId];

                $familyBuf[] = [
                    'family_id'    => $familyId,
                    'member_a_id'  => $memberA,
                    'member_b_id'  => $memberB,
                    'married_date' => $marriedDate,
                    'active_status' => 1,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                ];

                // Children (0-2)
                for ($c = 0, $kids = $seq % 3; $c < $kids; $c++) {
                    $memberBuf[] = [
                        'family_id'        => $familyId,
                        'child_name'       => self::CHILD_NAMES[($seq + $c) % count(self::CHILD_NAMES)],
                        'date_of_birth'    => Carbon::parse($marriedDate)->addYears(2 + $c)->addMonths($seq % 6)->format('Y-m-d'),
                        'gender_id'        => (($seq + $c) % 2 === 0) ? 'G01' : 'G02',
                        'birth_fc_no'      => 'BFC' . str_pad($seq * 10 + $c, 9, '0', STR_PAD_LEFT),
                        'health_condition' => 1,
                        'active_status'    => 1,
                        'created_at'       => $now,
                        'updated_at'       => $now,
                    ];
                }
            }

            // ── Flush when batch is full ───────────────────────────────────
            if (count($peopleBuf) >= self::BATCH) {
                $this->flush($peopleBuf, $spouseBuf, $apptBuf, $teacherBuf, $currBuf, $qualBuf, $familyBuf, $memberBuf, $userBuf);
                $peopleBuf = $spouseBuf = $apptBuf = $teacherBuf = $currBuf
                           = $qualBuf = $familyBuf = $memberBuf = $userBuf = [];
            }

            $bar->advance();
        }

        // ── Flush remaining rows ──────────────────────────────────────────
        if (! empty($peopleBuf)) {
            $this->flush($peopleBuf, $spouseBuf, $apptBuf, $teacherBuf, $currBuf, $qualBuf, $familyBuf, $memberBuf, $userBuf);
        }

        // ── Bulk role assignment (1 query for all 10 000 users) ───────────
        DB::statement(
            "INSERT IGNORE INTO model_has_roles (role_id, model_type, model_id)
             SELECT ?, ?, id FROM users WHERE email LIKE 'teacher%@emis.school.lk'",
            [$teacherRoleId, 'App\Models\User']
        );

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info('Done! ' . number_format(self::TOTAL) . ' teachers seeded.');
    }

    // ── Batch flush ───────────────────────────────────────────────────────

    private function flush(
        array $people, array $spouses, array $appts,
        array $teachers, array $curr, array $quals,
        array $families, array $members, array $users
    ): void {
        DB::transaction(static function () use (
            $people, $spouses, $appts, $teachers,
            $curr, $quals, $families, $members, $users
        ) {
            // Insert order respects FK constraints:
            //   people → employer_appointments → teachers
            //                                  → employer_current_appointments
            //   people → people_education_qualifications
            //   people + people → families → family_members
            //   people → users
            DB::table('people')->insert($people);
            if ($spouses)  DB::table('people')->insert($spouses);
            DB::table('employer_appointments')->insert($appts);
            DB::table('teachers')->insert($teachers);
            DB::table('employer_current_appointments')->insert($curr);
            if ($quals)    DB::table('people_education_qualifications')->insert($quals);
            if ($families) DB::table('families')->insert($families);
            if ($members)  DB::table('family_members')->insert($members);
            DB::table('users')->insert($users);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function buildName(int $seq, bool $female, string $ethnicity): array
    {
        [$firstPool, $surnPool] = match ($ethnicity) {
            'E02'   => [$female ? self::TAMIL_F  : self::TAMIL_M,  self::TAMIL_S],
            'E04'   => [$female ? self::MUSLIM_F : self::MUSLIM_M, self::MUSLIM_S],
            default => [$female ? self::SINH_F   : self::SINH_M,   self::SINH_S],
        };

        $first   = $firstPool[$seq % count($firstPool)];
        $surname = $surnPool[$seq % count($surnPool)];
        $title   = $female ? (($seq % 3 === 0) ? 'T02' : 'T03') : 'T01';

        return ["{$first} {$surname}", $title];
    }

    /** Mirrors People::generateInitials() without touching the model. */
    private function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name));
        if (count($parts) > 1) {
            $last     = ucfirst(strtolower(array_pop($parts)));
            $initials = implode('.', array_map(fn ($p) => strtoupper($p[0]), $parts));
            return "{$initials}. {$last}";
        }
        return ucfirst(strtolower($name));
    }

    /** Query DB once to find current max sequence for a prefixed ID column. */
    private function lastSeq(string $table, string $col, string $pattern): int
    {
        $max = DB::table($table)->where($col, 'like', $pattern)->max($col);
        return $max ? (int) substr($max, -8) : 0;
    }
}
