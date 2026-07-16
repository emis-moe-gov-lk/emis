<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\EducationAdministratorServiceCategorySeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ReligionSeeder::class);
        $this->call(BloodGroupSeeder::class);
        $this->call(EthnicitySeeder::class);
        $this->call(TitleSeeder::class);
        $this->call(CivilStatusSeeder::class);
        $this->call(GenderSeeder::class);

        $this->call(EducationQualificationsSeeder::class);
        $this->call(EducationalQualificationGradeSeeder::class);

        $this->call(ProvinceSeeder::class);
        $this->call(DistrictSeeder::class);
        $this->call(DivisionalSecretariatOffices::class);
        $this->call(GnDivision::class);
        $this->call(CitysSeeder::class);
        $this->call(PoliceStationSeeder::class);
        $this->call(MohAreaSeeder::class);

        $this->call(OfficeLevelSeeder::class);
        $this->call(AuthoritySeeder::class);
        $this->call(MinistryOfEducationSeeder::class);
        $this->call(ProvincialMinistryOfEducationSeeder::class);
        $this->call(ProvincialEducationOfficeSeeder::class);
        $this->call(ZonalEducationOfficeSeeder::class);
        $this->call(DivisionalEducationOfficeSeeder::class);

        $this->call(InstitutionAuthoritySeeder::class);
        $this->call(InstitutionTypesTableSeeder::class);
        $this->call(InstitutionCategoriesTableSeeder::class);
        $this->call(InstitutionLanguageSeeder::class);
        $this->call(InstitutionGenderSeeder::class);
        $this->call(InstitutionEthnisitySeeder::class);
        $this->call(InstitutionalFacilitiesSeeder::class);
        $this->call(GradeSpanSeeder::class);
        $this->call(AppointedSubjectsSeeder::class);
        $this->call(SubjectSeeder::class);
        $this->call(AppointedSubjectsSeeder::class);
        $this->call(MediumOfInstructionSeeder::class);


        //removed the comment

    //    $this->call(InstitutionSeeder::class);

       $this->call(InstitutionTableSeederPart1::class);
        $this->call(InstitutionTableSeederPart2::class);
        $this->call(WorkplacesFromMinistrySeeder::class);

        $this->call(ServiceSeeder::class);
        $this->call(ServiceRankSeeder::class);
        $this->call(PositionSeeder::class);
        $this->call(TeacherTypeSeeder::class);
        $this->call(TeacherCategorySeeder::class);

        $this->call(PrincipalRecruitmentCategorySeeder::class);
        $this->call(EducationAdministratorServiceSubjectSeeder::class);
        $this->call(EducationAdministratorServiceCategorySeeder::class);

        $this->call(SuperAdminSeeder::class);
        $this->call(PeopleSeeder::class);
        $this->call(RolePermissionSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(DeoOfficerSeeder::class);
        $this->call(TeacherSeeder_02::class);
        $this->call(TeacherSeeder::class);
        // $this->call(TeacherSeeder_03::class);
        $this->call(TeacherSeeder_04::class);
        $this->call(RecruitmentCategorySeeder::class);



        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
