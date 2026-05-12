<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\OfficesController;
use App\Http\Controllers\API\InstitutionController;
use App\Http\Controllers\API\AuthenticationController;
use App\Http\Controllers\API\ApointedSubjectController;
use App\Http\Controllers\API\AuthorityController;
use App\Http\Controllers\API\BloodGroupController;
use App\Http\Controllers\API\TitleController;
use App\Http\Controllers\API\TeacherTypeController;
use App\Http\Controllers\API\TeacherCategoryController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\ServiceRankController;
use App\Http\Controllers\API\SubjectListController;
use App\Http\Controllers\API\AuthIdentityController;
use App\Http\Controllers\API\TeacherApiController;
use App\Http\Controllers\API\PrincipalApiController;
use App\Http\Controllers\API\VersionController;
use App\Http\Controllers\API\ChangeLogController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\UserApiController;
use App\Http\Controllers\API\UserManagementController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\DeoOfficerController;
use App\Http\Controllers\API\DosAdminController;
use App\Http\Controllers\API\MobileTeacherProfileController;
use App\Http\Controllers\API\EmployerAppointmentConfirmationController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\Pdf\TeacherPdf;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working 🚀'
    ]);
});


require base_path('routes/timetable.php');

Route::prefix('')->group(function () {

    Route::controller(AuthenticationController::class)->group(function () {
        Route::post('/login', 'login');
    });

    Route::controller(ApointedSubjectController::class)->group(function () {
        Route::get('/apointed-subjects', 'index');          // GET (all)
        Route::patch('/apointed-subjects/{id}', 'update');    // UPDATE (one)
    });

    Route::controller(AuthorityController::class)->group(function () {
        Route::get('/authorities', 'index');          // GET (all)
        Route::put('/authorities/{id}', 'update');    // UPDATE (one)
    });

    Route::controller(BloodGroupController::class)->group(function () {
        Route::get('/blood-groups', 'index');        // GET (all)
        Route::put('/blood-groups/{id}', 'update');  // UPDATE (one)
    });


    Route::controller(TitleController::class)->group(function () {
        Route::get('/titles', 'index');        // GET all
        Route::put('/titles/{id}', 'update');  // UPDATE
    });

    Route::controller(TeacherTypeController::class)->group(function () {
        Route::get('/teacher-types', 'index');        // GET all
        Route::put('/teacher-types/{id}', 'update');  // UPDATE
    });

    Route::controller(TeacherCategoryController::class)->group(function () {
        Route::get('/teacher-categories', 'index');        // GET all
        Route::get('/teacher-categories/{id}', 'show');    // GET one
        Route::put('/teacher-categories/{id}', 'update');  // UPDATE
    });

    Route::controller(ServiceController::class)->group(function () {
        Route::get('/services', 'index');        // GET all
        Route::get('/services/{id}', 'show');    // GET one
        Route::put('/services/{id}', 'update');  // UPDATE
    });

    Route::controller(ServiceRankController::class)->group(function () {
        Route::get('/service-ranks', 'index');        // Get all ranks
        Route::get('/service-ranks/{id}', 'show');    // Get one rank
        Route::put('/service-ranks/{id}', 'update');  // Update rank
    });

    Route::controller(SubjectListController::class)->group(function () {
        Route::get('/subjects', 'index');         // GET all
        Route::get('/subjects/{id}', 'show');     // GET one
        Route::put('/subjects/{id}', 'update');   // UPDATE
    });

    Route::controller(OfficesController::class)->group(function () {
        Route::get('/moe-list', 'moeList');          // GET (all)
        Route::get('/pmoe-list', 'pmoeList');         // GET (all)
        Route::get('/peo-list', 'peoList');           // GET (all)
        Route::get('/zeo-list', 'zeoList')->middleware('auth:jwt');           // GET (all)
        Route::get('/deo-list', 'deoList')->middleware('auth:jwt');           // GET (all)
        Route::get('/office/{type}/{workplace_id}', 'singleOffice');
    });

    Route::controller(InstitutionController::class)->middleware('auth:jwt')->group(function () {
        Route::get('/institutions', 'index');         // GET all
        Route::get('/institutions/{id}', 'show');     // GET one
        Route::put('/institutions/{id}', 'update');   // UPDATE
    });

    Route::controller(TeacherApiController::class)->middleware('auth:jwt')->group(function () {
        Route::get('/teacher-settings', 'index');     // GET all
        Route::get('/teachers-list', 'teacherList');  // GET all teachers
        Route::post('/teacher-create', 'store');      // POST
        Route::patch('/teachers/{people_id}', 'updateProfile');
        Route::get('/teacher/{people_id}', 'getTeacher');
        Route::get('/teachers/check-nic/{nic}', 'getTeacherWithNIC');
        Route::get('/teachers/personal-form-data', 'getPersonalFromData');
        Route::get('/register/appointment-form-data', 'getAppoinmentFromData');                         // first appointment
        Route::get('/teachers/current-appointment-form-data', 'getCurrentAppointmentFormData');      // current appointment (role-filtered)
        Route::post('/teachers/check-contact', 'checkContact');                                       // POST check email/phone
        Route::post('/teachers/{people_id}/education-qualifications', 'saveEducationQualification');
        Route::get('/education-qualifications', 'getEducationQualifications');                           // GET qualification lookup
        Route::get('/education-qualification-grades', 'getEducationQualificationGrades');               // GET grade lookup
    });

    Route::controller(PrincipalApiController::class)->middleware('auth:jwt')->group(function () {
        Route::get('/principals-list', 'principalList');  // GET all principals
        Route::post('/principal-create', 'store');
        Route::get('/principal-recruitment-categories', 'recruitmentCategories');
        Route::get('/principal/{people_id}', 'getPrincipal');
    });

    Route::controller(\App\Http\Controllers\API\AlertController::class)->middleware('auth:jwt')->group(function () {
        Route::get('/alerts/counts', 'counts');
        Route::get('/alerts/pending-verification', 'pendingVerification');
        Route::get('/alerts/revised', 'revised');
        Route::get('/alerts/pending-confirmation', 'pendingConfirmation');
        Route::get('/alerts/rejected', 'rejected');
    });

    Route::controller(EmployerAppointmentConfirmationController::class)->middleware('auth:jwt')->group(function () {
        Route::get('/employer-appointment-reject-comments', 'rejectComments');
        Route::get('/employer-appointment-reject-comments/profile/{people_id}', 'rejectCommentsByProfile');
        Route::patch('/employer-appointment-reject-comments/{id}', 'updateRejectComment');
        Route::patch('/teachers/{people_id}/verify', 'verify');
        Route::patch('/teachers/{people_id}/confirm', 'confirm');
        Route::patch('/principals/{people_id}/confirm', 'confirm');
        Route::patch('/teachers/{people_id}/promote', 'promote');
        Route::patch('/teachers/{people_id}/reject', 'reject');
        Route::patch('/teachers/{people_id}/update', 'updateRejectedStatus');
        Route::patch('/teachers/{people_id}/rejected-status', 'updateRejectedStatus');
    });


    Route::controller(DosAdminController::class)->middleware('auth:jwt')->prefix('dos-admins')->group(function () {
        Route::get('/', 'index');         // GET all DOS admins
        Route::post('/', 'store');        // POST register education administrator
        Route::get('/{id}', 'show');      // GET single DOS admin profile
    });

    Route::controller(DeoOfficerController::class)->middleware('auth:jwt')->prefix('deo-officers')->group(function () {
        Route::get('/', 'index');                      // GET all DEO officers
        Route::get('/form-data', 'formData');          // GET form dropdown data
        Route::post('/', 'store');                     // POST create
        Route::get('/{id}', 'show');            // GET single
        Route::patch('/{id}', 'update');        // PATCH update
        Route::delete('/{id}', 'destroy');      // DELETE deactivate
    });

    Route::get('/identity', AuthIdentityController::class)->middleware('auth:jwt');
    Route::get('/mobile/identity', MobileTeacherProfileController::class)->middleware('auth:jwt');
    Route::patch('/profile', [ProfileController::class, 'update'])->middleware('auth:jwt');
    Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto']);
    Route::patch('/profile/password', [ProfileController::class, 'changePassword'])->middleware('auth:jwt');
    Route::post('/profile/password/complete-external', [ProfileController::class, 'completeExternalPasswordChange'])->middleware('auth:jwt');
    Route::get('/user/{people_id}', UserApiController::class)->middleware('auth:jwt');
    Route::get('/dashboard/{people_id}', DashboardController::class)->middleware('auth:jwt');
    Route::get('/pdf/teacher/{people_id}', [TeacherPdf::class, 'generateSimplePdf'])->middleware('auth:jwt');


    Route::middleware('auth:jwt')->group(function () {
        // User Management
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::patch('/users/{id}', [UserManagementController::class, 'update']);
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
        Route::patch('/users/{id}/toggle-status', [UserManagementController::class, 'toggleStatus']);
        Route::post('/users/{id}/reset-password', [UserManagementController::class, 'resetPassword']);

        // role management
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{id}', [RoleController::class, 'update']);
    });

    // permission management
    Route::get('/permissions', [RoleController::class, 'getpermissions']);
    Route::get('/permissions/{roleid}', [RoleController::class, 'getuserpermissions']);
    Route::delete('/permissions/{roleid}', [RoleController::class, 'destroy']);


    Route::controller(VersionController::class)->group(function () {
        Route::get('/versions', 'index');           // GET all versions with change logs
//        Route::get('/versions/{id}', 'show');       // GET one version with change logs
        Route::post('/versions', 'store');          // POST create version
        Route::put('/versions/{id}', 'update');     // PUT update version
        Route::delete('/versions/{id}', 'destroy'); // DELETE version
    });

//    Route::controller(ChangeLogController::class)->group(function () {
//        Route::post('/versions/{versionId}/change-logs', 'store');              // POST create change log
//        Route::put('/versions/{versionId}/change-logs/{id}', 'update');        // PUT update change log
//        Route::delete('/versions/{versionId}/change-logs/{id}', 'destroy');    // DELETE change log
//    });

});
