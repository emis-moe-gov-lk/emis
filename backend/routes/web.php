<?php
//
//use App\Livewire\Roles\RoleEdit;
//use App\Livewire\Users\UserEdit;
//use App\Livewire\ChangeLog\Index;
//use App\Livewire\Roles\RoleIndex;
//use App\Livewire\Sleas\SleasList;
//use App\Livewire\Sltas\SltasList;
//use App\Livewire\Sltes\SltesList;
//use App\Livewire\Users\UserIndex;
//use App\Livewire\Roles\RoleCreate;
//use App\Livewire\Settings\Profile;
//use App\Livewire\Users\UserCreate;
//use App\Livewire\Settings\Password;
//
//use App\Livewire\Sleas\SleasCreate;
//use App\Livewire\Sltas\SltasCreate;
//use App\Livewire\Sltes\SltesCreate;
//
//use App\Livewire\Settings\Appearance;
//use App\Livewire\Teacher\TeacherEdit;
//use App\Livewire\Teacher\TeacherList;
//
//
//use Illuminate\Support\Facades\Route;
//use App\Livewire\Offices\OfficesIndex;
//
//use App\Http\Controllers\Pdf\TeacherId;
//use App\Http\Controllers\SMSController;
//
//use App\Livewire\Teacher\TeacherCreate;
//
//use App\Livewire\Teacher\TeacherProfile;
//use App\Http\Controllers\NiceHashRefresh;
//use App\Livewire\Principal\PrincipalEdit;
//use App\Livewire\Principal\PrincipalList;
//use App\Livewire\MyProfile\MyProfileIndex;
//use App\Livewire\Sleas\Profile\SleasIndex;
//use App\Livewire\Sltas\Profile\SltasIndex;
//use App\Livewire\Sltes\Profile\SltesIndex;
//use App\Livewire\CadreDMSApproved\CadreAdd;
//use App\Livewire\Principal\PrincipalCreate;
//use App\Livewire\Sleas\Profile\SleasFamily;
//use App\Livewire\Sltas\Profile\SltasFamily;
//use App\Livewire\Sltes\Profile\SltesFamily;
//use App\Livewire\CadreDMSApproved\CadreEdit;
//use App\Livewire\CadreDMSApproved\CadreView;
//use App\Livewire\Offices\Deo\DeoOfficesList;
//use App\Livewire\Offices\Moe\MoeOfficesList;
//use App\Livewire\Offices\Peo\PeoOfficesList;
//use App\Livewire\Offices\Zeo\ZeoOfficesList;
//use App\Http\Controllers\DashboardController;
//use App\Livewire\CadreDMSApproved\CadreIndex;
////use App\Livewire\Institutions\InstitutionsProfile;
//use App\Livewire\MainTables\MainTablesGender;
////use App\Livewire\Institutions\InstitutionsProfile;
//use App\Livewire\Offices\Deo\DeoOfficesCreate;
//use App\Livewire\Offices\Deo\Profile\DeoStaff;
//use App\Livewire\Offices\Moe\MoeOfficesCreate;
////use App\Livewire\Institutions\InstitutionsProfile;
//use App\Livewire\Offices\Moe\Profile\MoeStaff;
////use App\Livewire\Institutions\InstitutionsProfile;
//use App\Livewire\Offices\Peo\PeoOfficesCreate;
//use App\Livewire\Offices\Peo\Profile\PeoStaff;
//use App\Livewire\Offices\Pmoe\PmoeOfficesList;
////use App\Livewire\Institutions\InstitutionsProfile;
//use App\Livewire\Offices\Zeo\Profile\ZeoStaff;
//use App\Livewire\Offices\Zeo\ZeoOfficesCreate;
//use App\Livewire\MainTables\MainTablesCityList;
//use App\Livewire\MainTables\MainTablesDistrict;
//use App\Livewire\MainTables\MainTablesDSOffice;
////use App\Livewire\Institutions\InstitutionsProfile;
//use App\Livewire\MainTables\MainTablesOverview;
////use App\Livewire\Institutions\InstitutionsProfile;
//use App\Livewire\Offices\Deo\DeoOfficesProfile;
//use App\Livewire\Offices\Moe\MoeOfficesProfile;
//use App\Livewire\Offices\Peo\PeoOfficesProfile;
//use App\Livewire\Offices\Zeo\ZeoOfficesProfile;
//use App\Livewire\Offices\Zeo\ZonaleOfficeByPeo;
//use App\Livewire\Sleas\Profile\SleasEmployment;
//use App\Livewire\Sltas\Profile\SltasEmployment;
//use App\Livewire\Sltes\Profile\SltesEmployment;
//use App\Livewire\Subjects\ApointedSubjectIndex;
//use App\Livewire\Subjects\TeachingSubjectIndex;
//use App\Livewire\Institutions\InstitutionsIndex;
//use App\Livewire\Offices\Deo\Profile\DeoProfile;
//use App\Livewire\Offices\Moe\Profile\Moeprofile;
//use App\Livewire\Offices\Peo\Profile\PeoProfile;
//use App\Livewire\Offices\Peo\Profile\PeoZeoList;
//use App\Livewire\Offices\Pmoe\PmoeOfficesCreate;
//use App\Livewire\Offices\Pmoe\Profile\PmoeStaff;
//use App\Livewire\Offices\Zeo\Profile\ZeoProfile;
//use App\Livewire\Institutions\InstitutionsCreate;
//use App\Livewire\Offices\Deo\Profile\DeoOverview;
//use App\Livewire\Offices\Moe\Profile\MoeOverview;
//use App\Livewire\Offices\Peo\Profile\PeoOverview;
//use App\Livewire\Offices\Pmoe\PmoeOfficesProfile;
//use App\Livewire\Offices\Zeo\Profile\ZeoOverview;
//use App\Http\Controllers\Auth\OIDCLoginController;
//use App\Livewire\MainTables\MainTablesAuthorities;
//use App\Livewire\MainTables\MainTablesBloodGroups;
//use App\Livewire\MainTables\MainTablesCivilStatus;
//use App\Livewire\MainTables\MainTablesEthnicities;
//use App\Livewire\Offices\Pmoe\Profile\PmoeProfile;
//use App\Livewire\Principal\Profile\PrincipalIndex;
//use App\Livewire\Sleas\Profile\SleasQualification;
//use App\Livewire\Sltas\Profile\SltasQualification;
//use App\Livewire\Sltes\Profile\SltesQualification;
//use App\Livewire\Institutions\Profile\ReportModule;
//use App\Livewire\Offices\Pmoe\Profile\PmoeOverview;
//use App\Livewire\Principal\Profile\PrincipalFamily;
//use App\Livewire\Offices\Deo\DivisionalOfficeByZone;
//use App\Livewire\Offices\Peo\ProvincialOfficeByPmoe;
//use App\Livewire\Offices\Deo\Profile\DeoReportModule;
//use App\Livewire\Offices\Zeo\Profile\ZeoReportModule;
//
//
//use App\Livewire\Offices\Zeo\Profile\ZeoTeachersList;
//use App\Livewire\Institutions\Profile\CadreDMSApprove;
//use App\Livewire\Institutions\InstitutionsBasicProfile;
//use App\Livewire\Institutions\Profile\InstitutionStaff;
//use App\Livewire\Offices\Institutions\InstitutionsList;
//use App\Livewire\Principal\Profile\PrincipalEmployment;
//use App\Livewire\Offices\Deo\Profile\DeoDmsCadreSummary;
//use App\Livewire\Offices\Moe\Profile\MoeDmsCadreSummary;
//use App\Livewire\Offices\Peo\Profile\PeoDmsCadreSummary;
//use App\Livewire\Offices\Zeo\Profile\ZeoDmsCadreSummary;
//use App\Livewire\Offices\Zeo\Profile\ZeoInstitutionsList;
//use App\Http\Controllers\Pdf\InstitutionsReportController;
//use App\Livewire\Institutions\Profile\InstitutionsProfile;
//use App\Livewire\Offices\Pmoe\Profile\PmoeDmsCadreSummary;
//use App\Livewire\Principal\Profile\PrincipalQualification;
//use App\Livewire\Institutions\Profile\InstitutionsOverview;
//use App\Livewire\Offices\Institutions\InstitutionsListByDeo;
//use App\Livewire\MainTables\MainTablesEducationQualifications;
//

//Route::get('/', function () {
//    return view('welcome');
//})->name('home');
//
///*
//    |--------------------------------------------------------------------------
//    | OIDC Login / Logout
//    |--------------------------------------------------------------------------
//    */
//
//Route::get('/oidc-login', [OIDCLoginController::class, 'redirectToProvider'])->name('oidc.login');
//Route::get('/auth/callback', [OIDCLoginController::class, 'handleProviderCallback']);
//Route::post('/oidc-login', [OIDCLoginController::class, 'logout'])->name('oidc.logout');
//
//Route::middleware(['auth', 'verified'])->group(function () {
//    Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
//    Route::get('sms-test', [SMSController::class, 'mobileSMSTest'])->name('sms.test');
//});

//Route::middleware(['auth'])->group(function () {
//    Route::redirect('settings', 'settings/profile');
//
//    Route::get('settings/profile', Profile::class)->name('settings.profile');
//    Route::get('settings/password', Password::class)->name('settings.password');
//    Route::get('settings/appearance', Appearance::class)->name('settings.appearance');
//
//    Route::get('change-log/index', Index::class)->name('change-log.index');
//
//
//    //Route::get('users', UserIndex::class)->name('users.index');
//    //Route::get('users/create', UserCreate::class)->name('users.create');
//    //Route::get('users/{id}/edit', UserEdit::class)->name('users.edit');
//
//    /*
//    |--------------------------------------------------------------------------
//    | Users Management
//    |--------------------------------------------------------------------------
//    */
//    Route::get('users/index', UserIndex::class)
//        ->name('users.index')
//        ->middleware(['permission:user.list.view']);
//
//    Route::get('users/{id}/edit', UserEdit::class)
//        ->name('users.edit')
//        ->middleware(['permission:user.update']);
//
//    Route::get('users/create', UserCreate::class)
//        ->name('users.create')
//        ->middleware(['permission:user.create']);
//
//
//    /*
//    |--------------------------------------------------------------------------
//    | Institutions Management
//    |--------------------------------------------------------------------------
//    */
//    Route::get('institutions', InstitutionsIndex::class)
//        ->name('institutions.index')
//        ->middleware(['permission:institution.list.view']);
//
//    Route::get('institutions/create', InstitutionsCreate::class)
//        ->name('institutions.create')
//        ->middleware(['permission:institution.create']);
//
//    Route::get('institutions/{id}/view', InstitutionsBasicProfile::class)
//        ->name('institutions.basic.view')
//        ->middleware(['permission:institution.profile.view']);
//
//    Route::get('institutions/{id}/profile/overview', InstitutionsOverview::class)
//        ->name('institutions.profile.overview')
//        ->middleware(['permission:institution.profile.overview.view']);
//
//    Route::get('institutions/{id}/profile/profile', InstitutionsProfile::class)
//        ->name('institutions.profile.profile')
//        ->middleware(['permission:institution.profile.profile.view|office.institution.profile.profile.view']);
//
//    Route::get('institutions/{id}/profile/staff', InstitutionStaff::class)
//        ->name('institutions.profile.staff')
//        ->middleware(['permission:institution.profile.staff.view|office.institution.profile.staff.view']);
//
//    Route::get('institutions/{id}/profile/cadre-dms-approved', CadreDMSApprove::class)
//        ->name('institutions.profile.cadre-dms-approved')
//        ->middleware(['permission:institution.profile.cadre-dms-approved.view|office.institution.profile.cadre-dms-approved.view']);
//
//    Route::get('institutions/{id}/profile/report-module', ReportModule::class)
//        ->name('institutions.profile.report-module')
//        ->middleware(['permission:institution.profile.report-module.view|office.institution.profile.report-module.view']);
//
//    Route::get('/pdf/institutions/{id}', [InstitutionsReportController::class, 'teacherList'])
//        ->name('institutions.teacher-list')
//        ->middleware(['permission:institution.profile.report-module.pdf|office.institution.profile.report-module.pdf']);
//
//    /*
//    |--------------------------------------------------------------------------
//    | Offices Management
//    |--------------------------------------------------------------------------
//    */
//    // MOE
//    Route::get('offices/moe/{id}/profile/overview', MoeOverview::class)
//        ->name('offices.moe.profile.overview')
//        ->middleware(['permission:office.moe.profile.overview.view']);
//
//    Route::get('offices/moe/{id}/profile/moefprofile', MoeProfile::class)
//        ->name('offices.moe.profile.moeprofile');
//
//    Route::get('offices/moe/{id}/profile/staff', MoeStaff::class)
//        ->name('offices.moe.profile.staff');
//
//    Route::get('offices/moe/{id}/profile/dms-cadre-summary', MoeDmsCadreSummary::class)
//        ->name('offices.moe.profile.dms-cadre-summary');
//
//    // PMOE
//    Route::get('offices/pmoe/{id}/profile/overview', PmoeOverview::class)
//        ->name('offices.pmoe.profile.overview')
//        ->middleware(['permission:office.pmoe.profile.overview.view']);
//
//    Route::get('offices/pmoe/{id}/profile/profile', PmoeProfile::class)
//        ->name('offices.pmoe.profile.profile');
//
//    Route::get('offices/pmoe/{id}/profile/staff', PmoeStaff::class)
//        ->name('offices.pmoe.profile.staff');
//
//    Route::get('offices/pmoe/{id}/profile/dms-cadre-summary', PmoeDmsCadreSummary::class)
//        ->name('offices.pmoe.profile.dms-cadre-summary');
//
//    // PEO
//    Route::get('offices/peo/{id}/profile/overview', PeoOverview::class)
//        ->name('offices.peo.profile.overview')
//        ->middleware(['permission:office.peo.profile.overview.view']);
//
//    Route::get('offices/peo/{id}/profile/profile', PeoProfile::class)
//        ->name('offices.peo.profile.profile');
//
//    Route::get('offices/peo/{id}/profile/staff', PeoStaff::class)
//        ->name('offices.peo.profile.staff');
//
//    Route::get('offices/peo/{id}/profile/zeo-list', PeoZeoList::class)
//        ->name('offices.peo.profile.zeo-list');
//
//    Route::get('offices/peo/{id}/profile/dms-cadre-summary', PeoDmsCadreSummary::class)
//        ->name('offices.peo.profile.dms-cadre-summary');
//
//    // ZEO
//    Route::get('offices/zeo/{id}/profile/overview', ZeoOverview::class)
//        ->name('offices.zeo.profile.overview')
//        ->middleware(['permission:office.zeo.profile.overview.view']);
//
//    Route::get('offices/zeo/{id}/profile/profile', ZeoProfile::class)
//        ->name('offices.zeo.profile.profile');
//
//    Route::get('offices/zeo/{id}/profile/staff', ZeoStaff::class)
//        ->name('offices.zeo.profile.staff');
//
//    Route::get('offices/zeo/{id}/profile/institutions-list', ZeoInstitutionsList::class)
//        ->name('offices.zeo.profile.institutions-list');
//
//    Route::get('offices/zeo/{id}/profile/teachers-list', ZeoTeachersList::class)
//        ->name('offices.zeo.profile.teachers-list');
//
//    Route::get('offices/zeo/{id}/profile/report-module', ZeoReportModule::class)
//        ->name('offices.zeo.profile.report-module');
//
//    Route::get('offices/zeo/{id}/profile/dms-cadre-summary', ZeoDmsCadreSummary::class)
//        ->name('offices.zeo.profile.dms-cadre-summary');
//
//    // DEO
//    Route::get('offices/deo/{id}/profile/overview', DeoOverview::class)
//        ->name('offices.deo.profile.overview')
//        ->middleware(['permission:office.deo.profile.overview.view']);
//
//    Route::get('offices/deo/{id}/profile/profile', DeoProfile::class)
//        ->name('offices.deo.profile.profile');
//
//    Route::get('offices/deo/{id}/profile/staff', DeoStaff::class)
//        ->name('offices.deo.profile.staff');
//
//    Route::get('offices/deo/{id}/profile/report', DeoReportModule::class)
//        ->name('offices.deo.profile.report-module');
//
//    Route::get('offices/deo/{id}/profile/dms-cadre-summary', DeoDmsCadreSummary::class)
//        ->name('offices.deo.profile.dms-cadre-summary');
//
//    /*
//    |--------------------------------------------------------------------------
//    | Offices CRUD
//    |--------------------------------------------------------------------------
//    */
//    Route::get('offices/hierarchy', OfficesIndex::class)
//        ->name('offices.index');
//
//    // DEO Offices
//    Route::get('offices/deo/list', DeoOfficesList::class)
//        ->name('offices.deo.list')
//        ->middleware(['permission:office.deo.list.view']);
//
//    Route::get('offices/deo/create', DeoOfficesCreate::class)
//        ->name('offices.deo.create')
//        ->middleware(['permission:office.deo.create']);
//
//    Route::get('offices/deo/{id}/zone-by', DivisionalOfficeByZone::class)
//        ->name('offices.deo.by-zone')
//        ->middleware(['permission:office.deo.list.view']);
//
//    Route::get('offices/deo/{id}/profile', DeoOfficesProfile::class)
//        ->name('offices.deo.profile');
//
//
//
//    // ZEO Offices
//    Route::get('offices/zeo/list', ZeoOfficesList::class)
//        ->name('offices.zeo.list')
//        ->middleware(['permission:office.zeo.list.view']);
//
//    Route::get('offices/zeo/create', ZeoOfficesCreate::class)
//        ->name('offices.zeo.create')
//        ->middleware(['permission:office.zeo.create']);
//
//    Route::get('offices/zeo/{id}/province-by', ZonaleOfficeByPeo::class)
//        ->name('offices.zeo.by-province')
//        ->middleware(['permission:office.zeo.list.view']);
//
//    Route::get('offices/zeo/{id}/profile', ZeoOfficesProfile::class)
//        ->name('offices.zeo.profile');
//
//    // PEO Offices
//    Route::get('offices/peo/list/', PeoOfficesList::class)
//        ->name('offices.peo.list')
//        ->middleware(['permission:office.peo.list.view']);
//
//    Route::get('offices/peo/create', PeoOfficesCreate::class)
//        ->name('offices.peo.create')
//        ->middleware(['permission:office.peo.create']);
//
//    Route::get('offices/peo/{id}/pmoe-by', ProvincialOfficeByPmoe::class)
//        ->name('offices.peo.by-pmoe')
//        ->middleware(['permission:office.pmoe.list.view']);
//
//    Route::get('offices/peo/{id}/profile', PeoOfficesProfile::class)
//        ->name('offices.peo.profile');
//
//    // PMOE Offices
//    Route::get('offices/pmoe/list', PmoeOfficesList::class)
//        ->name('offices.pmoe.list')
//        ->middleware(['permission:office.pmoe.list.view']);
//
//    Route::get('offices/pmoe/create', PmoeOfficesCreate::class)
//        ->name('offices.pmoe.create')
//        ->middleware(['permission:office.pmoe.create']);
//
//    Route::get('offices/pmoe/{id}/profile', PmoeOfficesProfile::class)
//        ->name('offices.pmoe.profile');
//
//    // MOE Offices
//    Route::get('offices/moe/list', MoeOfficesList::class)
//        ->name('offices.moe.list')
//        ->middleware(['permission:office.moe.list.view']);
//
//    Route::get('offices/moe/create', MoeOfficesCreate::class)
//        ->name('offices.moe.create')
//        ->middleware(['permission:office.moe.create']);
//
//    Route::get('offices/moe/{id}/profile', MoeOfficesProfile::class)
//        ->name('offices.moe.profile');
//
//    // Institutions in Offices
//    Route::get('offices/institutions/list', InstitutionsList::class)
//        ->name('offices.institutions.list');
//
//    Route::get('offices/institutions/{id}/division-by', InstitutionsListByDeo::class)
//        ->name('offices.institutions.by-devision');
//
//    // In web.php or api.php
//    Route::middleware(['role:super admin'])->group(function () {
//        // Routes accessible only by users with the 'admin' role
//        Route::get('roles', RoleIndex::class)->name('roles.index');
//        Route::get('roles/create', RoleCreate::class)->name('roles.create');
//        Route::get('roles/{id}/edit', RoleEdit::class)->name('roles.edit');
//    });
//
//
//    // Cadre DMS Approved
//
//    Route::get('cadre-dms-approved', CadreIndex::class)->name('cadre-dms-approved.index')->middleware(['permission:cadre-dms-approved.index.view']);
//    Route::get('cadre-dms-approved/{id}/view', CadreView::class)->name('cadre-dms-approved.view')->middleware(['permission:cadre-dms-approved.institution.view']);
//    Route::get('cadre-dms-approved/{school_id}/{circular_id}/add', CadreAdd::class)->name('cadre-dms-approved.add')->middleware(['permission:cadre-dms-approved.add']);
//    Route::get('cadre-dms-approved/{id}/edit', CadreEdit::class)->name('cadre-dms-approved.edit')->middleware(['permission:cadre-dms-approved.edit']);
//});


