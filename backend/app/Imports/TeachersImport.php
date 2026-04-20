<?php

namespace App\Imports;

use App\Models\People;
use App\Models\Teacher;
use Illuminate\Support\Facades\DB;
use App\Models\EmployerAppointment;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use App\Models\EmployerCurrentAppointment;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class TeachersImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows
{
    protected $userId;
    protected int $successCount = 0;
    protected int $failCount = 0;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    /**
     * Convert each row to a model instance.
     */
    public function model(array $row)
    {
        // Skip if NIC is empty
        if (empty($row['nic'])) {
            $this->failCount++;
            return null;
        }

        $healthValue = trim(strtolower($row['health_condition'] ?? 'yes'));
        $healthCondition = in_array($healthValue, ['yes', 'y', 'true', '1'], true);

        $initials = People::generateInitials($row['full_name'] ?? '');
        $appointmentId = EmployerAppointment::generateAppointmentId($row['first_appointment_date'] ?? null);

        DB::beginTransaction();

        try {
            // Check if people already exists with this NIC
            $nicHash = hash('sha256', strtoupper($row['nic']));
            $existingPeople = People::where('nic_hash', $nicHash)->first();

            if ($existingPeople) {
                $people = $existingPeople;
                // Update existing record
                $people->update([
                    'title_id' => $row['title_id'] ?? null,
                    'full_name' => $row['full_name'] ?? null,
                    'name_with_initials' => $initials,
                    'gender_id' => $row['gender_id'] ?? null,
                    'date_of_birth' => $row['date_of_birth'] ?? null,
                    'religion_id' => $row['religion_id'] ?? null,
                    'ethnicity_id' => $row['ethnicity_id'] ?? null,
                    'civil_status_id' => $row['civil_status_id'] ?? null,
                    'health_condition' => $healthCondition,
                    'health_problem' => $row['health_problem'] ?? null,
                    'blood_group_id' => $row['blood_group_id'] ?? null,
                    'email' => $row['email'] ?? null,
                    'phone' => $row['phone'] ?? null,
                    'district_id' => $row['district_id'] ?? null,
                    'gn_division_id' => $row['gn_division_id'] ?? null,
                    'address_line1' => $row['address_line1'] ?? '',
                    'address_line2' => $row['address_line2'] ?? '',
                    'address_line3' => $row['address_line3'] ?? null,
                    'postal_code' => $row['postal_code'] ?? null,
                    'latitude' => $row['latitude'] ?? null,
                    'longitude' => $row['longitude'] ?? null,
                    't_address_line1' => $row['t_address_line1'] ?? null,
                    't_address_line2' => $row['t_address_line2'] ?? null,
                    't_address_line3' => $row['t_address_line3'] ?? null,
                    't_postal_code' => $row['t_postal_code'] ?? null,
                ]);
            } else {
                // Create new people record
                $people = People::create([
                    'nic' => $row['nic'] ?? null,
                    'nic_hash' => $nicHash,
                    'title_id' => $row['title_id'] ?? null,
                    'full_name' => $row['full_name'] ?? null,
                    'name_with_initials' => $initials,
                    'gender_id' => $row['gender_id'] ?? null,
                    'date_of_birth' => $row['date_of_birth'] ?? null,
                    'religion_id' => $row['religion_id'] ?? null,
                    'ethnicity_id' => $row['ethnicity_id'] ?? null,
                    'civil_status_id' => $row['civil_status_id'] ?? null,
                    'health_condition' => $healthCondition,
                    'health_problem' => $row['health_problem'] ?? null,
                    'blood_group_id' => $row['blood_group_id'] ?? null,
                    'email' => $row['email'] ?? null,
                    'phone' => $row['phone'] ?? null,
                    'district_id' => $row['district_id'] ?? null,
                    'gn_division_id' => $row['gn_division_id'] ?? null,
                    'address_line1' => $row['address_line1'] ?? '',
                    'address_line2' => $row['address_line2'] ?? '',
                    'address_line3' => $row['address_line3'] ?? null,
                    'postal_code' => $row['postal_code'] ?? null,
                    'latitude' => $row['latitude'] ?? null,
                    'longitude' => $row['longitude'] ?? null,
                    't_address_line1' => $row['t_address_line1'] ?? null,
                    't_address_line2' => $row['t_address_line2'] ?? null,
                    't_address_line3' => $row['t_address_line3'] ?? null,
                    't_postal_code' => $row['t_postal_code'] ?? null,
                    'profile_picture' => 'default.png',
                    //'created_by' => $this->userId,
                ]);
            }

            // Update or create employer appointment
            EmployerAppointment::updateOrCreate(
                ['employee_id' => $people->people_id],
                [
                    'appointment_id' => $appointmentId,
                    'employee_id' => $people->people_id,
                    'first_appointment_date' => $row['first_appointment_date'] ?? null,
                    'retirement_date' => $row['retirement_date'] ?? null,
                    'service_id' => $row['service_id'] ?? null,
                    'rank_id' => $row['rank_id'] ?? null,
                    'position_id' => 'POS001',
                    'office_level_id' => 'OLID006',
                    'workplace_id' => $row['workplace_id'] ?? null,
                    'appointment_letter_no' => $row['appointment_letter_no'] ?? null,
                    'appointment_letter' => 'default_letter.pdf',
                    'w_op_no' => $row['w_op_no'] ?? null,
                    //'created_by' => $this->userId,
                ]
            );

            // Create or update Current Appointment
            EmployerCurrentAppointment::updateOrCreate(
                ['employee_id' => $people->people_id],
                [
                    'appointment_id' => $appointmentId,
                    'employee_id' => $people->people_id,
                    'appoint_date' => $row['current_appoint_date'] ?? null,
                    'service_id' => $row['current_service_id'] ?? null,
                    'rank_id' => $row['current_rank_id'] ?? null, // FIXED: removed extra $
                    'office_level_id' => 'OLID006',
                    'position_id' => 'POS001',
                    'workplace_id' => $row['current_workplace_id'] ?? null,
                ]
            );

            // Create or update Teacher record
            Teacher::updateOrCreate(
                ['employee_id' => $people->people_id],
                [
                    'appointment_id' => $appointmentId,
                    'employee_id' => $people->people_id,
                    'teacher_category' => $row['teacher_category'] ?? null,
                    'teacher_type' => $row['teacher_type'] ?? null,
                    'appointment_medium' => $row['appointment_medium'] ?? null,
                    'appointment_subject' => $row['appointment_subject'] ?? null,
                    'main_subject' => $row['main_subject'] ?? null,
                    'secondary_subject' => $row['secondary_subject'] ?? null,
                    'current_teaching_subject' => $row['current_teaching_subject'] ?? null,
                ]
            );

            DB::commit();
            $this->successCount++;
            return $people;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->failCount++;
            Log::error('Teacher import failed', [
                'row' => $row,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    public function rules(): array
    {
        return [
            'nic' => 'required|string|max:12',
            'full_name' => 'required|string|max:255',
            'title_id' => 'required|string|max:3|exists:titles,title_id',
            'gender_id' => 'required|string|max:3|exists:gender_lists,gender_id',
            'religion_id' => 'required|string|max:3|exists:religions,religion_id',
            'ethnicity_id' => 'required|string|max:3|exists:ethnicities,ethnicity_id',
            'civil_status_id' => 'required|string|max:3|exists:civil_statuses,civil_status_id',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:15',
            'date_of_birth' => 'required|date',
            // EmployerAppointment related validations
            'first_appointment_date' => 'required|date',
            'service_id' => 'required|string|max:10|exists:services,service_id',
            'rank_id' => 'required|string|max:10|exists:service_ranks,rank_id',
            'workplace_id' => 'required|string|max:10|exists:workplaces,workplace_id',
            'appointment_letter_no' => 'required|string|max:255',
            'w_op_no' => 'nullable|string|max:255',
            // current employee check
            'current_appoint_date' => 'required|date',
            'current_service_id' => 'required|string|max:10|exists:services,service_id',
            'current_rank_id' => 'required|string|max:10|exists:service_ranks,rank_id',
            'current_workplace_id' => 'required|string|max:10|exists:workplaces,workplace_id',
            // Teacher related validations
            'teacher_category' => 'required|string|max:10|exists:teacher_categories,categories_id',
            'teacher_type' => 'required|string|max:10|exists:teacher_types,teacher_types_id',
            'appointment_medium' => 'required|string|max:10|exists:medium_of_instructions,medium_id',
            'appointment_subject' => 'required|string|max:10|exists:apointed_subjects,a_subject_id',
            'main_subject' => 'nullable|string|max:10|exists:subject_lists,subject_id',
            'secondary_subject' => 'nullable|string|max:10|exists:subject_lists,subject_id',
            'current_teaching_subject' => 'nullable|string|max:10|exists:subject_lists,subject_id',
        ];
    }

    public function getSuccessCount(): int
    {
        return $this->successCount;
    }

    public function getFailCount(): int
    {
        return $this->failCount;
    }
}
