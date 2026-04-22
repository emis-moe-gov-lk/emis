<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EducationAdministratorServiceSubject;

class EducationAdministratorServiceSubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $subjects = [
            [
                'eas_subject_id' => 'EAS001',
                'subject' => 'General',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS002',
                'subject' => 'Sinhala',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS003',
                'subject' => 'Tamil',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS004',
                'subject' => 'English',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS005',
                'subject' => 'Other Languages',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS006',
                'subject' => 'Mathematics',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS007',
                'subject' => 'Science',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS008',
                'subject' => 'Commerce',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS009',
                'subject' => 'Information Technology',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS010',
                'subject' => 'Health and Physical Education',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS011',
                'subject' => 'Buddhism',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS012',
                'subject' => 'Christianity',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS013',
                'subject' => 'Hinduism',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS014',
                'subject' => 'Islam',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS015',
                'subject' => 'Student consulting and counseling',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS016',
                'subject' => 'Esthetics',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS017',
                'subject' => 'Technology',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS018',
                'subject' => 'Special Education',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS019',
                'subject' => 'Planning',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS020',
                'subject' => 'Primary Education',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS021',
                'subject' => 'History',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'eas_subject_id' => 'EAS022',
                'subject' => 'Other',
                'active_status' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($subjects as $subject) {
            EducationAdministratorServiceSubject::updateOrCreate(
                ['eas_subject_id' => $subject['eas_subject_id']],
                $subject
            );
        }
    }
}
