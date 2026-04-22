<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;

class TeachersTemplateExport implements FromCollection, WithHeadings, WithTitle, WithStrictNullComparison
{
    /**
     * Return sample data rows for the Excel template.
     */
    public function collection()
    {
        return collect([
            // Sample data row 1
            [
                '123456789V',       // nic
                'T01',              // title_id
                'John Doe',         // full_name
                'G01',              // gender_id
                '1990-05-15',       // date_of_birth (YYYY-MM-DD)
                'R01',              // religion_id
                'E01',              // ethnicity_id
                'C01',              // civil_status_id
                'YES',              // health_condition (YES/NO)
                '',                 // health_problem (if health_condition is NO)
                'B01',              // blood_group_id
                'john.doe@example.com', // email
                '0771234567',       // phone
                'DIS001',           // district_id
                'GND00001',         // gn_division_id
                '123 Main Street',  // address_line1
                'Colombo 07',       // address_line2
                '',                 // address_line3
                '00700',            // postal_code
                '',                 // latitude (optional)
                '',                 // longitude (optional)
                '',                 // t_address_line1 (optional)
                '',                 // t_address_line2 (optional)
                '',                 // t_address_line3 (optional)
                '',                 // t_postal_code (optional)
                // EmployerAppointment fields
                '2020-01-15',       // first_appointment_date
                '2055-01-15',       // retirement_date
                'SER001',           // service_id
                'RANK001',          // rank_id
                'INS0000001',       // workplace_id
                'APPT/2020/001',    // appointment_letter_no
                'WOP001234',        // w_op_no
                // Current appointment
                '2020-01-15',       // current_appoint_date
                'SER001',           // current_service_id
                'RANK001',          // current_rank_id
                'INS0000001',       // current_workplace_id
                // Teacher fields
                'TCAT0001',         // teacher_category
                'TCHTYPE001',       // teacher_type
                'MED01',            // appointment_medium
                'ASUB0001',         // appointment_subject
                'SUB0001',          // main_subject
                'SUB0002',          // secondary_subject
                'SUB0001',          // current_teaching_subject
            ],
            // Sample data row 2 (with different values)
            [
                '987654321V',
                'T02',
                'Jane Smith',
                'G02',
                '1985-08-20',
                'R02',
                'E02',
                'C02',
                'NO',
                'Asthma',
                'B02',
                'jane.smith@example.com',
                '0777654321',
                'DIS002',
                'GND00002',
                '456 Park Avenue',
                'Kandy',
                '',
                '20000',
                '',
                '',
                '',
                '',
                '',
                '',
                '2018-03-10',
                '2048-03-10',
                'SER002',
                'RANK002',
                'INS0000002',
                'APPT/2018/045',
                'WOP002345',
                '2018-03-10',
                'SER002',
                'RANK002',
                'INS0000002',
                'TCAT0002',
                'TCHTYPE002',
                'MED02',
                'ASUB0002',
                'SUB0003',
                'SUB0004',
                'SUB0003',
            ]
        ]);
    }

    /**
     * Define the Excel headings to match import structure.
     */
    public function headings(): array
    {
        return [
            // People model fields
            'nic',                          // Required - Format: 123456789V or 123456789X
            'title_id',                     // Required - Reference: titles table (T01, T02, etc.)
            'full_name',                    // Required
            'gender_id',                    // Required - Reference: gender_lists table (G01, G02, etc.)
            'date_of_birth',                // Required - Format: YYYY-MM-DD
            'religion_id',                  // Required - Reference: religions table (R01, R02, etc.)
            'ethnicity_id',                 // Required - Reference: ethnicities table (E01, E02, etc.)
            'civil_status_id',              // Required - Reference: civil_statuses table (C01, C02, etc.)
            'health_condition',             // Required - Values: YES/NO
            'health_problem',               // Optional - Required if health_condition is NO
            'blood_group_id',               // Required - Reference: blood_groups table (B01, B02, etc.)
            'email',                        // Required - Unique email address
            'phone',                        // Required - Unique phone number
            'district_id',                  // Required - Reference: districts table (DIS001, DIS002, etc.)
            'gn_division_id',               // Required - Reference: gn_divisions table (GND00001, etc.)
            'address_line1',                // Required
            'address_line2',                // Required
            'address_line3',                // Optional
            'postal_code',                  // Required
            'latitude',                     // Optional
            'longitude',                    // Optional
            't_address_line1',              // Optional - Temporary address
            't_address_line2',              // Optional - Temporary address
            't_address_line3',              // Optional - Temporary address
            't_postal_code',                // Optional - Temporary address postal code
            
            // EmployerAppointment fields
            'first_appointment_date',       // Required - Format: YYYY-MM-DD
            'retirement_date',              // Required - Format: YYYY-MM-DD
            'service_id',                   // Required - Reference: services table (SER001, SER002, etc.)
            'rank_id',                      // Required - Reference: service_ranks table (RANK001, RANK002, etc.)
            'workplace_id',                 // Required - Reference: workplaces table (INS0000001, etc.)
            'appointment_letter_no',        // Required
            'w_op_no',                      // Required - Working OP number
            
            // Current appointment fields
            'current_appoint_date',         // Required - Format: YYYY-MM-DD
            'current_service_id',           // Required - Reference: services table
            'current_rank_id',              // Required - Reference: service_ranks table
            'current_workplace_id',         // Required - Reference: workplaces table
            
            // Teacher specific fields
            'teacher_category',             // Required - Reference: teacher_categories table (TCAT0001, etc.)
            'teacher_type',                 // Required - Reference: teacher_types table (TCHTYPE001, etc.)
            'appointment_medium',           // Required - Reference: medium_of_instructions table (MED01, etc.)
            'appointment_subject',          // Required - Reference: apointed_subjects table (ASUB0001, etc.)
            'main_subject',                 // Optional - Reference: subject_lists table (SUB0001, etc.)
            'secondary_subject',            // Optional - Reference: subject_lists table
            'current_teaching_subject',     // Optional - Reference: subject_lists table
        ];
    }

    /**
     * Worksheet tab name.
     */
    public function title(): string
    {
        return 'Teachers Template';
    }
}