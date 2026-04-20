<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('subject_lists')->insert([
            
            [
                'subject_id' => 'SUB0001',
                'name_en' => 'Buddhism',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0002',
                'name_en' => 'Sinhala Language & Literature',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0003',
                'name_en' => 'English Language',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0004',
                'name_en' => 'Mathematics',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0005',
                'name_en' => 'History',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0006',
                'name_en' => 'Business & Accounting Studies',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0007',
                'name_en' => 'Civic Education',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0008',
                'name_en' => 'Entrepreneurship Studies',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0009',
                'name_en' => 'Second Language (Sinhala)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0010',
                'name_en' => 'Second Language (Tamil)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0011',
                'name_en' => 'Music (Oriental)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0012',
                'name_en' => 'Music (Western)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0013',
                'name_en' => 'Music (Carnatic)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0014',
                'name_en' => 'Dancing (Oriental)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0015',
                'name_en' => 'Dancing (Bharata)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0016',
                'name_en' => 'Appreciation of English Literary Texts',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0017',
                'name_en' => 'Appreciation of Sinhala Literary Texts',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0018',
                'name_en' => 'Drama and Theatre (Sinhala)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0019',
                'name_en' => 'Drama and Theatre (Tamil)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0020',
                'name_en' => 'Drama and Theatre (English)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0021',
                'name_en' => 'Information & Communication Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0022',
                'name_en' => 'Agriculture & Food Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0023',
                'name_en' => 'Home Economics',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0024',
                'name_en' => 'Health & Physical Education',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0025',
                'name_en' => 'Communication & Media Studies',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0026',
                'name_en' => 'Physics',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0027',
                'name_en' => 'Chemistry',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0028',
                'name_en' => 'Agricultural Science',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0029',
                'name_en' => 'Biology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0030',
                'name_en' => 'Combined Mathematics',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0031',
                'name_en' => 'Higher Mathematics',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0032',
                'name_en' => 'General English',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0033',
                'name_en' => 'Civil Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0034',
                'name_en' => 'Mechanical Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0035',
                'name_en' => 'Electrical, Electronic and Information Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0036',
                'name_en' => 'Food Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0037',
                'name_en' => 'Agriculture Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0038',
                'name_en' => 'BioResource Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0039',
                'name_en' => 'Economics',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0040',
                'name_en' => 'Political Science',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0041',
                'name_en' => 'Logic and Scientific Method',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0042',
                'name_en' => 'History of Sri Lanka',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0043',
                'name_en' => 'History of India',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0044',
                'name_en' => 'History of Europe',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0045',
                'name_en' => 'Modern World History',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0046',
                'name_en' => 'Business Statistics',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0047',
                'name_en' => 'Business Studies',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0048',
                'name_en' => 'Accountancy',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0049',
                'name_en' => 'Hinduism',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0050',
                'name_en' => 'Buddhist Civilization',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0051',
                'name_en' => 'Art',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0052',
                'name_en' => 'Dancing (Indigenous)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0053',
                'name_en' => 'Dancing (Bharatha)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0054',
                'name_en' => 'Music (Carnatic)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0055',
                'name_en' => 'Engineering Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0056',
                'name_en' => 'Biosystems Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0057',
                'name_en' => 'Science for Technology',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0058',
                'name_en' => 'Sinhala',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0059',
                'name_en' => 'English',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0060',
                'name_en' => 'Sinhala Language',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0061',
                'name_en' => 'Tamil Language',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0062',
                'name_en' => 'Science',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0063',
                'name_en' => 'Geography',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0064',
                'name_en' => 'Life Skills & Citizenship Education',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0065',
                'name_en' => 'Practical & Technical Skills',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0066',
                'name_en' => 'Music(Western)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
            [
                'subject_id' => 'SUB0067',
                'name_en' => 'Music(Oriental)',
                'active_status' => true,
                'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'updated_at' => Carbon::now()->format('Y-m-d H:i:s')

            ],
        ]);
    }
}
