<?php

namespace Database\Seeders;

use App\Models\ApointedSubject;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AppointedSubjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjectsData = [
            [
                'a_subject_id' => 'ASUB0001',
                'name_en' => 'Primary General',
            ],
            [
                'a_subject_id' => 'ASUB0002',
                'name_en' => 'English',
            ],
            [
                'a_subject_id' => 'ASUB0003',
                'name_en' => 'Health & Physical Education',
            ],
            [
                'a_subject_id' => 'ASUB0004',
                'name_en' => 'Home Economics',
            ],
            [
                'a_subject_id' => 'ASUB0005',
                'name_en' => 'Commerce',
            ],
            [
                'a_subject_id' => 'ASUB0006',
                'name_en' => 'Eastern Music',
            ],
            [
                'a_subject_id' => 'ASUB0007',
                'name_en' => 'Agricultural Science',
            ],
            [
                'a_subject_id' => 'ASUB0008',
                'name_en' => 'Art',
            ],
            [
                'a_subject_id' => 'ASUB0009',
                'name_en' => 'Arts and Crafts',
            ],
            [
                'a_subject_id' => 'ASUB0010',
                'name_en' => 'Bio Systems Technology',
            ],
            [
                'a_subject_id' => 'ASUB0011',
                'name_en' => 'Biology',
            ],
            [
                'a_subject_id' => 'ASUB0012',
                'name_en' => 'Botany',
            ],
            [
                'a_subject_id' => 'ASUB0013',
                'name_en' => 'Buddhism',
            ],
            [
                'a_subject_id' => 'ASUB0014',
                'name_en' => 'Chemistry',
            ],
            [
                'a_subject_id' => 'ASUB0015',
                'name_en' => 'Construction Technology',
            ],
            [
                'a_subject_id' => 'ASUB0016',
                'name_en' => 'Dancing (Traditional)',
            ],
            [
                'a_subject_id' => 'ASUB0017',
                'name_en' => 'Engineering Technology',
            ],
            [
                'a_subject_id' => 'ASUB0018',
                'name_en' => 'History',
            ],
            [
                'a_subject_id' => 'ASUB0019',
                'name_en' => 'Information & Communication Technology',
            ],
            [
                'a_subject_id' => 'ASUB0020',
                'name_en' => 'Mathematics',
            ],
            [
                'a_subject_id' => 'ASUB0021',
                'name_en' => 'Performing Arts',
            ],
            [
                'a_subject_id' => 'ASUB0022',
                'name_en' => 'Physical Education',
            ],
            [
                'a_subject_id' => 'ASUB0023',
                'name_en' => 'Physics',
            ],
            [
                'a_subject_id' => 'ASUB0024',
                'name_en' => 'Science',

            ],
            [
                'a_subject_id' => 'ASUB0025',
                'name_en' => 'Sinhala',

            ],
            [
                'a_subject_id' => 'ASUB0026',
                'name_en' => 'Sinhala Language & Literature',
            ],
            [
                'a_subject_id' => 'ASUB0027',
                'name_en' => 'Communication & Media Studies',
            ],
            [
                'a_subject_id' => 'ASUB0028',
                'name_en' => 'Graduate Appointment - Art',
            ],
            [
                'a_subject_id' => 'ASUB0029',
                'name_en' => 'Graduate Appointment - Commerce',
            ],
            [
                'a_subject_id' => 'ASUB0030',
                'name_en' => 'Civic Education',
            ],
            [
                'a_subject_id' => 'ASUB0031',
                'name_en' => 'Library & Information Studies',
            ],
            [
                'a_subject_id' => 'ASUB0032',
                'name_en' => 'Other (not Related to OL/AL Subjects)',
            ],
            [
                'a_subject_id' => 'ASUB0033',
                'name_en' => 'History & Social Studies',
            ],
            [
                'a_subject_id' => 'ASUB0034',
                'name_en' => 'Accounting',
            ],
            [
                'a_subject_id' => 'ASUB0035',
                'name_en' => 'Agriculture & Food Technology',
            ],
            [
                'a_subject_id' => 'ASUB0036',
                'name_en' => 'Combined Mathematics',
            ],
            [
                'a_subject_id' => 'ASUB0037',
                'name_en' => 'Counseling & Guidance',
            ],
            [
                'a_subject_id' => 'ASUB0038',
                'name_en' => 'Hindu Civilization',
            ],
            [
                'a_subject_id' => 'ASUB0039',
                'name_en' => 'Karnataka Music',
            ],
            [
                'a_subject_id' => 'ASUB0040',
                'name_en' => 'Social Studies',
            ],
            [
                'a_subject_id' => 'ASUB0041',
                'name_en' => 'Tamil',
            ],
            [
                'a_subject_id' => 'ASUB0042',
                'name_en' => 'Catholicism',
            ],
            [
                'a_subject_id' => 'ASUB0043',
                'name_en' => 'Christianity',
            ],
            [
                'a_subject_id' => 'ASUB0044',
                'name_en' => 'Second Language - Sinhala',
            ],
            [
                'a_subject_id' => 'ASUB0045',
                'name_en' => 'Islam',
            ],
            [
                'a_subject_id' => 'ASUB0046',
                'name_en' => 'Primary English',
            ],
            [
                'a_subject_id' => 'ASUB0047',
                'name_en' => 'Buddhist Civilization',
            ],
            [
                'a_subject_id' => 'ASUB0048',
                'name_en' => 'Food Technology',
            ],
            [
                'a_subject_id' => 'ASUB0049',
                'name_en' => 'Geography',
            ],
            [
                'a_subject_id' => 'ASUB0050',
                'name_en' => 'Business & Accounting Studies',
            ],
            [
                'a_subject_id' => 'ASUB0051',
                'name_en' => 'Citizenship Education & Governance',
            ],
            [
                'a_subject_id' => 'ASUB0052',
                'name_en' => 'Political Science',
            ],
            [
                'a_subject_id' => 'ASUB0053',
                'name_en' => 'Western Music',
            ],
            [
                'a_subject_id' => 'ASUB0054',
                'name_en' => 'Agro Technology',
            ],
            [
                'a_subject_id' => 'ASUB0055',
                'name_en' => 'Dancing Baratha',
            ],
            [
                'a_subject_id' => 'ASUB0056',
                'name_en' => 'Business Studies',
            ],
            [
                'a_subject_id' => 'ASUB0057',
                'name_en' => 'Elements of Political Science',
            ],
            [
                'a_subject_id' => 'ASUB0058',
                'name_en' => 'Design & Technology',
            ],
            [
                'a_subject_id' => 'ASUB0059',
                'name_en' => 'Drama & Theatre (T)',
            ],
            [
                'a_subject_id' => 'ASUB0060',
                'name_en' => 'Economics',
            ],
            [
                'a_subject_id' => 'ASUB0061',
                'name_en' => 'Hinduism',
            ],
            [
                'a_subject_id' => 'ASUB0062',
                'name_en' => 'Sociology (Social Science)',
            ],
            [
                'a_subject_id' => 'ASUB0063',
                'name_en' => 'Business Statistics',
            ],
            [
                'a_subject_id' => 'ASUB0064',
                'name_en' => 'Electrical and Electronic Studies',
            ],
            [
                'a_subject_id' => 'ASUB0065',
                'name_en' => 'General English',
            ],
            [
                'a_subject_id' => 'ASUB0066',
                'name_en' => 'Islamic Civilization',
            ],
            [
                'a_subject_id' => 'ASUB0067',
                'name_en' => 'Landscaping',
            ],
            [
                'a_subject_id' => 'ASUB0068',
                'name_en' => 'Logic and Scientific Method',
            ],
            [
                'a_subject_id' => 'ASUB0069',
                'name_en' => 'period not Named',
            ],
            [
                'a_subject_id' => 'ASUB0070',
                'name_en' => 'Physical Education and Sports',
            ],
            [
                'a_subject_id' => 'ASUB0071',
                'name_en' => 'Science / Maths',
            ],
            [
                'a_subject_id' => 'ASUB0072',
                'name_en' => 'Tamil Language & Literature',
            ],
            [
                'a_subject_id' => 'ASUB0073',
                'name_en' => 'Life Confidence and Civic Education',
            ],
            [
                'a_subject_id' => 'ASUB0074',
                'name_en' => 'Practical and Technical skills',
            ],
            [
                'a_subject_id' => 'ASUB0075',
                'name_en' => 'Drama & Theatre (S)',
            ],
            [
                'a_subject_id' => 'ASUB0076',
                'name_en' => 'Not Specified',
            ],
            [
                'a_subject_id' => 'ASUB0077',
                'name_en' => 'Statistics',
            ],
            [
                'a_subject_id' => 'ASUB0078',
                'name_en' => 'Second Language - Tamil',
            ],
            [
                'a_subject_id' => 'ASUB0079',
                'name_en' => 'Christian Civilization',
            ],
            [
                'a_subject_id' => 'ASUB0080',
                'name_en' => 'Motor Mechanic',
            ],
            [
                'a_subject_id' => 'ASUB0081',
                'name_en' => 'Thripitaka Dhamma',
            ],
            [
                'a_subject_id' => 'ASUB0082',
                'name_en' => 'Pali',
            ],
            [
                'a_subject_id' => 'ASUB0083',
                'name_en' => 'Sanskrit',
            ],
            [
                'a_subject_id' => 'ASUB0084',
                'name_en' => 'Education',
            ],
            [
                'a_subject_id' => 'ASUB0085',
                'name_en' => 'Fishery & Food Technology',
            ],
            [
                'a_subject_id' => 'ASUB0086',
                'name_en' => 'Special Education',
            ],
            [
                'a_subject_id' => 'ASUB0087',
                'name_en' => 'Arabic',
            ],
            [
                'a_subject_id' => 'ASUB0088',
                'name_en' => 'Art and Designing',
            ],
            [
                'a_subject_id' => 'ASUB0089',
                'name_en' => 'Mathematics I',
            ],
            [
                'a_subject_id' => 'ASUB0090',
                'name_en' => 'Event Management',
            ],
            [
                'a_subject_id' => 'ASUB0091',
                'name_en' => 'Higher Mathematics',
            ],
            [
                'a_subject_id' => 'ASUB0092',
                'name_en' => 'Professional Subject',
            ],
            [
                'a_subject_id' => 'ASUB0093',
                'name_en' => 'Science for Technology',
            ],
            [
                'a_subject_id' => 'ASUB0094',
                'name_en' => 'Aesthetic-English Literature',
            ],
            [
                'a_subject_id' => 'ASUB0095',
                'name_en' => 'Japanese',
            ],
            [
                'a_subject_id' => 'ASUB0096',
                'name_en' => 'Does not Teach',
            ],
            [
                'a_subject_id' => 'ASUB0097',
                'name_en' => 'Entrepreneurship education',
            ],
            [
                'a_subject_id' => 'ASUB0098',
                'name_en' => 'Textile and Apparel Studies',
            ],
            [
                'a_subject_id' => 'ASUB0099',
                'name_en' => 'Aesthetic-Drama & Theatre (Sinhala)',
            ],
            [
                'a_subject_id' => 'ASUB0100',
                'name_en' => 'Common General Test',
            ],
            [
                'a_subject_id' => 'ASUB0101',
                'name_en' => 'Aesthetic-Tamil Literature',
            ],
            [
                'a_subject_id' => 'ASUB0102',
                'name_en' => 'Chinese',
            ],
            [
                'a_subject_id' => 'ASUB0103',
                'name_en' => 'Graphic Designing',
            ],
            [
                'a_subject_id' => 'ASUB0104',
                'name_en' => 'Mechanical Technology',
            ],
            [
                'a_subject_id' => 'ASUB0105',
                'name_en' => 'Metal Work',
            ],
            [
                'a_subject_id' => 'ASUB0106',
                'name_en' => 'Management',
            ],
            [
                'a_subject_id' => 'ASUB0107',
                'name_en' => 'Aesthetic-Drama & Theatre (Tamil)',
            ],
            [
                'a_subject_id' => 'ASUB0108',
                'name_en' => 'Environmental Studies',
            ],
            [
                'a_subject_id' => 'ASUB0109',
                'name_en' => 'Computer Science',
            ],
            [
                'a_subject_id' => 'ASUB0110',
                'name_en' => 'Philosophy',
            ],
            [
                'a_subject_id' => 'ASUB0111',
                'name_en' => 'Crafts & Arts',
            ],
            [
                'a_subject_id' => 'ASUB0112',
                'name_en' => 'Hindi',
            ],
            [
                'a_subject_id' => 'ASUB0113',
                'name_en' => 'GIT',
            ],
            [
                'a_subject_id' => 'ASUB0114',
                'name_en' => 'Health and Social Care',
            ],
            [
                'a_subject_id' => 'ASUB0115',
                'name_en' => 'Aesthetic-Arabic Literature',
            ],
            [
                'a_subject_id' => 'ASUB0116',
                'name_en' => 'Software Development',
            ],
            [
                'a_subject_id' => 'ASUB0117',
                'name_en' => 'Child Psychology and Care',
            ],
            [
                'a_subject_id' => 'ASUB0118',
                'name_en' => 'Tourism and Hospitality',
            ],
            [
                'a_subject_id' => 'ASUB0119',
                'name_en' => 'Theology',
            ],
            [
                'a_subject_id' => 'ASUB0120',
                'name_en' => 'Drama & Theatre (E)',
            ],
            [
                'a_subject_id' => 'ASUB0121',
                'name_en' => 'Supervision',
            ],
            [
                'a_subject_id' => 'ASUB0122',
                'name_en' => 'Zoology',
            ],
            [
                'a_subject_id' => 'ASUB0123',
                'name_en' => 'Electrical, Electronic And Information Technology',
            ],
            [
                'a_subject_id' => 'ASUB0124',
                'name_en' => 'Applied Maths',
            ],
            [
                'a_subject_id' => 'ASUB0125',
                'name_en' => 'Saivanery',
            ],
            [
                'a_subject_id' => 'ASUB0126',
                'name_en' => 'Wood Work',
            ],
            [
                'a_subject_id' => 'ASUB0127',
                'name_en' => 'Pure Maths',
            ],
            [
                'a_subject_id' => 'ASUB0128',
                'name_en' => 'Aesthetic-Sinhala Literature',
            ],
            [
                'a_subject_id' => 'ASUB0129',
                'name_en' => 'Bio Resource Technology',
            ],
            [
                'a_subject_id' => 'ASUB0130',
                'name_en' => 'History (Indian)',
            ],
            [
                'a_subject_id' => 'ASUB0131',
                'name_en' => 'Marine Fisheries',
            ],
            [
                'a_subject_id' => 'ASUB0132',
                'name_en' => 'Civil Technology',
            ],
            [
                'a_subject_id' => 'ASUB0133',
                'name_en' => 'Russian',
            ],
            [
                'a_subject_id' => 'ASUB0134',
                'name_en' => 'German',
            ],
            [
                'a_subject_id' => 'ASUB0135',
                'name_en' => 'Greek and Roman Civilization',
            ],
            [
                'a_subject_id' => 'ASUB0136',
                'name_en' => 'Construction Studies',
            ],
            [
                'a_subject_id' => 'ASUB0137',
                'name_en' => 'Korean',
            ],
            [
                'a_subject_id' => 'ASUB0138',
                'name_en' => 'French',
            ],
            [
                'a_subject_id' => 'ASUB0139',
                'name_en' => 'Textile Technology',
            ],
            [
                'a_subject_id' => 'ASUB0140',
                'name_en' => 'Psychology',
            ],
            [
                'a_subject_id' => 'ASUB0141',
                'name_en' => 'Web Designing',
            ],
            [
                'a_subject_id' => 'ASUB0142',
                'name_en' => 'Aquatic Resource Studies',
            ],
            [
                'a_subject_id' => 'ASUB0143',
                'name_en' => 'English Literature',
            ],
            [
                'a_subject_id' => 'ASUB0144',
                'name_en' => 'Plantation Product Studies',
            ],
            [
                'a_subject_id' => 'ASUB0145',
                'name_en' => 'Development Studies',
            ],
            [
                'a_subject_id' => 'ASUB0146',
                'name_en' => 'Appreciation of Tamil Literary Texts',
            ],
            [
                'a_subject_id' => 'ASUB0147',
                'name_en' => 'Fine Arts',
            ],
            [
                'a_subject_id' => 'ASUB0148',
                'name_en' => 'Pre Vocational Studies II',
            ],
            [
                'a_subject_id' => 'ASUB0149',
                'name_en' => 'Graduate Appointment - Aesthetic',
            ],
            [
                'a_subject_id' => 'ASUB0150',
                'name_en' => 'Home Gardening',
            ],
            [
                'a_subject_id' => 'ASUB0151',
                'name_en' => 'Electronic Documentation & Shorthand',
            ],
            [
                'a_subject_id' => 'ASUB0152',
                'name_en' => 'Food Processing Studies',
            ],
            [
                'a_subject_id' => 'ASUB0153',
                'name_en' => 'Persian',
            ],
            [
                'a_subject_id' => 'ASUB0154',
                'name_en' => 'Graduate Appointment - Science',
            ],
            [
                'a_subject_id' => 'ASUB0155',
                'name_en' => 'Fashion Designing',
            ],
            [
                'a_subject_id' => 'ASUB0156',
                'name_en' => 'Geometric & Mechanical Drawing',
            ],
            [
                'a_subject_id' => 'ASUB0157',
                'name_en' => 'Applied Horticultural Studies',
            ],
            [
                'a_subject_id' => 'ASUB0158',
                'name_en' => 'Archeology',
            ],
            [
                'a_subject_id' => 'ASUB0159',
                'name_en' => 'Livestock Product Studies',
            ],
            [
                'a_subject_id' => 'ASUB0160',
                'name_en' => 'Entrepreneurship Studies',
            ],
            [
                'a_subject_id' => 'ASUB0161',
                'name_en' => 'Interior Designing',
            ],
            [
                'a_subject_id' => 'ASUB0162',
                'name_en' => 'Masonry',
            ],
            [
                'a_subject_id' => 'ASUB0163',
                'name_en' => 'Metal Fabrication Studies',
            ],
            [
                'a_subject_id' => 'ASUB0164',
                'name_en' => 'Planning',
            ],
            [
                'a_subject_id' => 'ASUB0165',
                'name_en' => 'History (European)',
            ],
            [
                'a_subject_id' => 'ASUB0166',
                'name_en' => 'Mathematics II',
            ],
            [
                'a_subject_id' => 'ASUB0167',
                'name_en' => 'Pottery, Firing & Glazing',
            ],
            [
                'a_subject_id' => 'ASUB0168',
                'name_en' => 'Project',
            ],
            [
                'a_subject_id' => 'ASUB0169',
                'name_en' => 'History (Modern World)',
            ],
            [
                'a_subject_id' => 'ASUB0170',
                'name_en' => 'Weaving (Hand or Power loom)',
            ],
            [
                'a_subject_id' => 'ASUB0171',
                'name_en' => 'Pre Vocational Studies I',
            ],
            [
                'a_subject_id' => 'ASUB0172',
                'name_en' => 'Business Economics',
            ],
            [
                'a_subject_id' => 'ASUB0173',
                'name_en' => 'Urdu',
            ],
            [
                'a_subject_id' => 'ASUB0174',
                'name_en' => 'Needle Work',
            ],
            [
                'a_subject_id' => 'ASUB0175',
                'name_en' => 'Ayurveda (Awasana)',
            ],
            [
                'a_subject_id' => 'ASUB0176',
                'name_en' => 'Ayurveda (Praramba)',
            ],
            [
                'a_subject_id' => 'ASUB0177',
                'name_en' => 'Radio Mechanic',
            ],
        ];

        foreach ($subjectsData as $subject) {
            ApointedSubject::firstOrCreate(
                ['a_subject_id' => $subject['a_subject_id']],
                $subject
            );
        }
    }
}
