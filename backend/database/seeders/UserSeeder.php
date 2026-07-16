<?php

namespace Database\Seeders;

use App\Helpers\NicHelper;
use App\Models\EmployerAppointment;
use App\Models\EmployerCurrentAppointment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\People;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Services\Wso2IsProvisioningService;

class UserSeeder extends Seeder
{
    public function run(Wso2IsProvisioningService $wso2Is): void
    {
        $staticUsers = [
            ['nic' => '900000000001', 'name' => 'SSA', 'email' => 'superadmin@gmail.com', 'contact' => '0700000001', 'password' => 'Password@123', 'role' => 'SSA', 'service_id' => 'SER006', 'rank_id' => 'RANK018', 'position_id' => 'POS019', 'office_level_id' => 'OLID001', 'workplace_kind' => 'national', 'workplace_value' => 'MOE0000001'],
            ['nic' => '900000000002', 'name' => 'MOE Administrator', 'email' => 'moeadmin@gmail.com', 'contact' => '0700000002', 'password' => 'Password@123', 'role' => 'MOE Administrator', 'service_id' => 'SER006', 'rank_id' => 'RANK017', 'position_id' => 'POS020', 'office_level_id' => 'OLID001', 'workplace_kind' => 'national', 'workplace_value' => 'MOE0000001'],
            ['nic' => '900000000003', 'name' => 'PSC Officer', 'email' => 'psc@gmail.com', 'contact' => '0700000003', 'password' => 'Password@123', 'role' => 'PSC Officer', 'service_id' => 'SER006', 'rank_id' => 'RANK016', 'position_id' => 'POS019', 'office_level_id' => 'OLID001', 'workplace_kind' => 'national', 'workplace_value' => 'MOE0000001'],
            ['nic' => '900000000004', 'name' => 'Provincial Director', 'email' => 'provinciald@gmail.com', 'contact' => '0700000004', 'password' => 'Password@123', 'role' => 'Provincial Director', 'service_id' => 'SER005', 'rank_id' => 'RANK015', 'position_id' => 'POS015', 'office_level_id' => 'OLID003', 'workplace_kind' => 'province', 'workplace_value' => 'Western'],
            ['nic' => '900000000005', 'name' => 'Provincial Deputy Director', 'email' => 'provincialdd@gmail.com', 'contact' => '0700000005', 'password' => 'Password@123', 'role' => 'Provincial Deputy Director', 'service_id' => 'SER005', 'rank_id' => 'RANK014', 'position_id' => 'POS017', 'office_level_id' => 'OLID003', 'workplace_kind' => 'province', 'workplace_value' => 'Western'],
            ['nic' => '900000000006', 'name' => 'Provincial Subject Head', 'email' => 'provincialsh@gmail.com', 'contact' => '0700000006', 'password' => 'Password@123', 'role' => 'Provincial Subject Head', 'service_id' => 'SER005', 'rank_id' => 'RANK014', 'position_id' => 'POS018', 'office_level_id' => 'OLID003', 'workplace_kind' => 'province', 'workplace_value' => 'Western'],
            ['nic' => '900000000007', 'name' => 'Provincial DEO', 'email' => 'provincialdeo@gmail.com', 'contact' => '0700000007', 'password' => 'Password@123', 'role' => 'Provincial DEO', 'service_id' => 'SER007', 'rank_id' => 'RANK019', 'position_id' => 'POS021', 'office_level_id' => 'OLID003', 'workplace_kind' => 'province', 'workplace_value' => 'Western'],
            ['nic' => '900000000008', 'name' => 'Zonal Director Kelaniya Zonal', 'email' => 'zonald@gmail.com', 'contact' => '0700000008', 'password' => 'Password@123', 'role' => 'Zonal Director', 'service_id' => 'SER005', 'rank_id' => 'RANK015', 'position_id' => 'POS011', 'office_level_id' => 'OLID004', 'workplace_kind' => 'zonal', 'workplace_value' => 'Kelaniya Zonal Education Office'],
            ['nic' => '900000000009', 'name' => 'Zonal Deputy Director', 'email' => 'zonaldd@gmail.com', 'contact' => '0700000009', 'password' => 'Password@123', 'role' => 'Zonal Deputy Director', 'service_id' => 'SER005', 'rank_id' => 'RANK014', 'position_id' => 'POS013', 'office_level_id' => 'OLID004', 'workplace_kind' => 'zonal', 'workplace_value' => 'Kelaniya Zonal Education Office'],
            ['nic' => '900000000010', 'name' => 'Zonal DEO Head Kelaniya Zonal', 'email' => 'zonalsh@gmail.com', 'contact' => '0700000010', 'password' => 'Password@123', 'role' => 'Zonal DEO HEAD', 'service_id' => 'SER005', 'rank_id' => 'RANK014', 'position_id' => 'POS014', 'office_level_id' => 'OLID004', 'workplace_kind' => 'zonal', 'workplace_value' => 'Kelaniya Zonal Education Office'],
            ['nic' => '900000000011', 'name' => 'Zonal DEO Kelaniya Zonal', 'email' => 'zonaldeo@gmail.com', 'contact' => '0700000011', 'password' => 'Password@123', 'role' => 'Zonal DEO', 'service_id' => 'SER007', 'rank_id' => 'RANK019', 'position_id' => 'POS021', 'office_level_id' => 'OLID004', 'workplace_kind' => 'zonal', 'workplace_value' => 'Kelaniya Zonal Education Office'],
            ['nic' => '900000000012', 'name' => 'Divisional Head', 'email' => 'divisionalhead@gmail.com', 'contact' => '0700000012', 'password' => 'Password@123', 'role' => 'Divisional Head', 'service_id' => 'SER005', 'rank_id' => 'RANK014', 'position_id' => 'POS010', 'office_level_id' => 'OLID005', 'workplace_kind' => 'divisional', 'workplace_value' => 'Wattala Divisional Education Office'],
            ['nic' => '900000000013', 'name' => 'Divisional DEO', 'email' => 'divisionaldeo@gmail.com', 'contact' => '0700000013', 'password' => 'Password@123', 'role' => 'Divisional DEO', 'service_id' => 'SER007', 'rank_id' => 'RANK019', 'position_id' => 'POS021', 'office_level_id' => 'OLID005', 'workplace_kind' => 'divisional', 'workplace_value' => 'Wattala Divisional Education Office'],
            ['nic' => '900000000018', 'name' => 'Divisional Deputy Director', 'email' => 'divisionaldeputy@gmail.com', 'contact' => '0700000018', 'password' => 'Password@123', 'role' => 'Divisional Deputy Director', 'service_id' => 'SER005', 'rank_id' => 'RANK014', 'position_id' => 'POS025', 'office_level_id' => 'OLID005', 'workplace_kind' => 'divisional', 'workplace_value' => 'Wattala Divisional Education Office'],
            ['nic' => '900000000014', 'name' => 'Principal', 'email' => 'principal@gmail.com', 'contact' => '0700000014', 'password' => 'Password@123', 'role' => 'principal', 'service_id' => 'SER004', 'rank_id' => 'RANK012', 'position_id' => 'POS006', 'office_level_id' => 'OLID006', 'workplace_kind' => 'school', 'workplace_value' => 'KERAWALAPITIYA VIDYALOKA M.V.'],
            ['nic' => '900000000015', 'name' => 'Vice Principal / Dep Principal', 'email' => 'viceprincipal@gmail.com', 'contact' => '0700000015', 'password' => 'Password@123', 'role' => 'Vice Principal / Dep Principal', 'service_id' => 'SER004', 'rank_id' => 'RANK011', 'position_id' => 'POS008', 'office_level_id' => 'OLID006', 'workplace_kind' => 'school', 'workplace_value' => 'KERAWALAPITIYA VIDYALOKA M.V.'],
            ['nic' => '900000000016', 'name' => 'Teacher', 'email' => 'teachertest@gmail.com', 'contact' => '0700000016', 'password' => 'Password@123', 'role' => 'teacher', 'service_id' => 'SER001', 'rank_id' => 'RANK001', 'position_id' => 'POS001', 'office_level_id' => 'OLID006', 'workplace_kind' => 'school', 'workplace_value' => 'KERAWALAPITIYA VIDYALOKA M.V.'],
            ['nic' => '900000000017', 'name' => 'School DEO', 'email' => 'schooldeo@gmail.com', 'contact' => '0700000017', 'password' => 'Password@123', 'role' => 'School DEO', 'service_id' => 'SER007', 'rank_id' => 'RANK019', 'position_id' => 'POS021', 'office_level_id' => 'OLID006', 'workplace_kind' => 'school', 'workplace_value' => 'KERAWALAPITIYA VIDYALOKA M.V.'],
        ];

        $total = count($staticUsers);

        foreach ($staticUsers as $index => $staticUser) {
            $normalizedNic = NicHelper::normalize($staticUser['nic']);
            $nicHash = NicHelper::hash($normalizedNic);
            $person = People::where('nic_hash', $nicHash)->first();
            $existingPeopleId = $person?->people_id;
            $workplaceId = $this->resolveWorkplaceId($staticUser['workplace_kind'], $staticUser['workplace_value']);

            $user = User::updateOrCreate(
                ['nic_hash' => $nicHash],
                [
                    'nic'             => $normalizedNic,
                    'people_id'       => $existingPeopleId,
                    'name'            => $staticUser['name'],
                    'email'           => $staticUser['email'],
                    'contact'         => $staticUser['contact'],
                    'password'        => $staticUser['password'],
                    'profile_picture' => null,
                    'remember_token'  => Str::random(10),
                    'active_status'   => '1',
                    'created_at'      => Carbon::now(),
                    'updated_at'      => Carbon::now(),
                ]
            );

            $role = Role::firstOrCreate(['name' => $staticUser['role']]);
            $user->syncRoles([$role->name]);

            $result = $wso2Is->provisionUser($user, $staticUser['password'], $staticUser['role']);
            if ($result['provisioned'] ?? false) {
                $this->command->info("  WSO2: provisioned {$staticUser['email']}");
            } else {
                $reason = $result['error'] ?? ($result['skipped'] ?? false ? 'WSO2 disabled' : 'unknown');
                $this->command->warn("  WSO2 provisioning failed for {$staticUser['email']}: {$reason}");
            }

            if (! $existingPeopleId) {
                continue;
            }

            $appointmentId = sprintf('APST%08d', $index + 1);
            $appointment = EmployerAppointment::updateOrCreate(
                [
                    'employee_id' => $existingPeopleId,
                    'service_id' => $staticUser['service_id'],
                ],
                [
                    'appointment_id' => $appointmentId,
                    'first_appointment_date' => '2025-01-01',
                    'retirement_date' => Carbon::parse($person->date_of_birth)->addYears(60)->format('Y-m-d'),
                    'rank_id' => $staticUser['rank_id'],
                    'position_id' => $staticUser['position_id'],
                    'office_level_id' => $staticUser['office_level_id'],
                    'workplace_id' => $workplaceId,
                    'appointment_letter_no' => sprintf('SEED-%03d', $index + 1),
                    'appointment_letter' => 'seed-letter.pdf',
                    'active_status' => '1',
                    'is_confirmed' => 1,
                    'updated_at' => Carbon::now(),
                    'created_at' => Carbon::now(),
                ]
            );

            EmployerCurrentAppointment::updateOrCreate(
                ['employee_id' => $existingPeopleId],
                [
                    'appointment_id' => $appointment->appointment_id,
                    'appoint_date' => $appointment->first_appointment_date,
                    'appointment_letter_no' => $appointment->appointment_letter_no,
                    'service_id' => $appointment->service_id,
                    'rank_id' => $appointment->rank_id,
                    'office_level_id' => $appointment->office_level_id,
                    'position_id' => $appointment->position_id,
                    'workplace_id' => $workplaceId,
                    'updated_at' => Carbon::now(),
                    'created_at' => Carbon::now(),
                ]
            );

            $this->command->getOutput()->writeln(
                $this->progressBar($index + 1, $total)
            );
        }
    }

    private function progressBar(int $current, int $total, int $width = 30): string
    {
        $percent = $total > 0 ? (int) floor(($current / $total) * 100) : 0;
        $filled  = $total > 0 ? (int) floor(($current / $total) * $width) : 0;

        $bar = str_repeat('=', max(0, $filled - 1)) . ($filled > 0 ? '>' : '');
        $bar = str_pad($bar, $width, ' ');

        return "  [{$bar}] {$percent}% ({$current}/{$total})";
    }

    private function resolveWorkplaceId(string $kind, string $value): string
    {
        return match ($kind) {
            'province' => (string) DB::table('provincial_education_offices')
                ->where('name', 'like', '%' . $value . '%')
                ->value('workplace_id'),
            'zonal' => (string) DB::table('zonal_education_offices')
                ->where('name', $value)
                ->value('workplace_id'),
            'divisional' => (string) DB::table('divisional_education_offices')
                ->where('name', $value)
                ->value('workplace_id'),
            'school' => (string) DB::table('institutions')
                ->where('name', $value)
                ->value('workplace_id'),
            default => $value,
        };
    }
}
