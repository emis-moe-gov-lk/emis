<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();


        // Create permissions
        $permissions = [
//             /*
//             |--------------------------------------------------------------------------
//             | Dashboard & Common
//             |--------------------------------------------------------------------------
//             */
//             'dashboard.main.view',

//             'student.list.view',

//             'attendance.list.view',
//             'attendance.manage.update',

//             'exam.result.view',
//             'exam.term_test.manage',

//             'resource.list.view',
//             'resource.manage.update',
//             'resource.allocation.create',
//             'resource.allocation.view',

//             "dashboard.view",
//             "dashboard.view.myprofile",
//             "dashboard.view.calendar",

//             /*
//             |--------------------------------------------------------------------------
//             | My Profile Management
//             |--------------------------------------------------------------------------
//             */

//             // My Profile – View
//             'my-profile.general.view',
//             'my-profile.qualification.view',
//             'my-profile.employment.view',
//             'my-profile.family.view',
//             'my-profile.pension-and-payment.view',
//             'my-profile.edit-request.view',

//             // My Profile – Management
//             'my-profile.edit-request.create',
//             'my-profile.edit-request.response',
//             'my-profile.verify',
//             'my-profile.confirm',
//             'my-profile.pdf.view',

//             // My Profile – Actions
//             'my-profile.personal-cultural.update',
//             'my-profile.health.update',
//             'my-profile.contact-information.update',
//             'my-profile.location-information.update',
//             'my-profile.temporary-location-information.update',

//             'my-profile.qualification.create',
//             'my-profile.qualification.delete',

//             'my-profile.employment.current-appointment.update',
//             'my-profile.employment.first-appointment.update',
//             'my-profile.employment.sltes-information.update',
//             'my-profile.employment.previous-service.create',
//             'my-profile.employment.previous-service.delete',
//             'my-profile.employment.services-history.create',
//             'my-profile.employment.services-history.delete',

//             'my-profile.pension-and-payment.update',
            
//             'my-profile.family.create',
//             'my-profile.family.delete',


//             "my-profile.view",
//             "my-profile.update",
//             "my-profile.verify",

//             /*
//             |--------------------------------------------------------------------------
//             | Teacher Management
//             |--------------------------------------------------------------------------
//             */

//             'teacher.list.view',
//             'teacher.create',
//             'teacher.update',
//             'teacher.delete',

//             // Teacher Profile – View
//             'teacher.profile.general.view',
//             'teacher.profile.qualification.view',
//             'teacher.profile.employment.view',
//             'teacher.profile.family.view',
//             'teacher.profile.pension-and-payment.view',
//             'teacher.profile.edit-request.view',

//             // Teacher Profile – Management
//             'teacher.profile.edit-request.create',
//             'teacher.profile.edit-request.response',
//             'teacher.profile.verify',
//             'teacher.profile.confirm',
//             'teacher.profile.id.view',
//             'teacher.profile.pdf.view',

//             // Teacher Profile – Actions
//             'teacher.bulk.upload',

//             'teacher.profile.personal-cultural.update',
//             'teacher.profile.health.update',
//             'teacher.profile.contact-information.update',
//             'teacher.profile.location-information.update',
//             'teacher.profile.temporary-location-information.update',

//             'teacher.profile.qualification.create',
//             'teacher.profile.qualification.delete',

//             'teacher.profile.employment.current-appointment.update',
//             'teacher.profile.employment.first-appointment.update',
//             'teacher.profile.employment.teacher-information.update',
//             'teacher.profile.employment.previous-service.create',
//             'teacher.profile.employment.previous-service.delete',
//             'teacher.profile.employment.services-history.create',
//             'teacher.profile.employment.services-history.delete',

//             'teacher.profile.pension-and-payment.update',

//             'teacher.profile.family.create',
//             'teacher.profile.family.delete',

//             'teacher.profile.promote',
//             'teacher.profile.edit.view',


//             // Roles Management

//             "roles.view",
//             "roles.view.create",
//             "roles.view.edit",
//             "roles.view.delete",

//             // main table 
//             "maintable.view",


//             /*
//             |--------------------------------------------------------------------------
//             | Principal Management
//             |--------------------------------------------------------------------------
//             */
//             'principal.list.view',
//             'principal.create',
//             'principal.update',
//             'principal.delete',

//             // Principal Profile – View
//             'principal.profile.general.view',
//             'principal.profile.qualification.view',
//             'principal.profile.employment.view',
//             'principal.profile.family.view',
//             'principal.profile.pension-and-payment.view',
//             'principal.profile.edit-request.view',

//             // Principal Profile – Management
//             'principal.profile.edit-request.create',
//             'principal.profile.edit-request.response',
//             'principal.profile.verify',
//             'principal.profile.confirm',
//             'principal.profile.id.view',
//             'principal.profile.pdf.view',

//             // Principal Profile – Actions
//             'principal.bulk.upload',

//             'principal.profile.personal-cultural.update',
//             'principal.profile.health.update',
//             'principal.profile.contact-information.update',
//             'principal.profile.location-information.update',
//             'principal.profile.temporary-location-information.update',

//             'principal.profile.qualification.create',
//             'principal.profile.qualification.delete',

//             'principal.profile.employment.current-appointment.update',
//             'principal.profile.employment.first-appointment.update',
//             'principal.profile.employment.principal-information.update',
//             'principal.profile.employment.previous-service.create',
//             'principal.profile.employment.previous-service.delete',
//             'principal.profile.employment.services-history.create',
//             'principal.profile.employment.services-history.delete',

//             'principal.profile.pension-and-payment.update',
            
//             'principal.profile.family.create',
//             'principal.profile.family.delete',


//             "principal.bulk.upload",
//             "principal.create",
//             "principal.delete",
//             "principal.list.view",
//             "principal.update",


//             /*
//             |--------------------------------------------------------------------------
//             | DOS Management
//             |--------------------------------------------------------------------------
//             */
//             'dos.list.view',
//             'dos.create',
//             'dos.update',
//             'dos.delete',

//             // DOS Profile – View
//             'dos.profile.general.view',
//             'dos.profile.qualification.view',
//             'dos.profile.employment.view',
//             'dos.profile.family.view',
//             'dos.profile.pension-and-payment.view',
//             'dos.profile.edit-request.view',

//             // DOS Profile – Management
//             'dos.profile.edit-request.create',
//             'dos.profile.edit-request.response',
//             'dos.profile.verify',
//             'dos.profile.confirm',
//             'dos.profile.id.view',
//             'dos.profile.pdf.view',

//             // DOS Profile – Actions
//             'dos.bulk.upload',

//             'dos.profile.personal-cultural.update',
//             'dos.profile.health.update',
//             'dos.profile.contact-information.update',
//             'dos.profile.location-information.update',
//             'dos.profile.temporary-location-information.update',

//             'dos.profile.qualification.create',
//             'dos.profile.qualification.delete',

//             'dos.profile.employment.current-appointment.update',
//             'dos.profile.employment.first-appointment.update',
//             'dos.profile.employment.dos-information.update',
//             'dos.profile.employment.previous-service.create',
//             'dos.profile.employment.previous-service.delete',
//             'dos.profile.employment.services-history.create',
//             'dos.profile.employment.services-history.delete',

//             'dos.profile.pension-and-payment.update',
            
//             'dos.profile.family.create',
//             'dos.profile.family.delete',


//             "dos.bulk.upload",
//             "dos.list.view",
//             "dos.profile.confirm",
//             "dos.profile.verify",


//             /*
//             |--------------------------------------------------------------------------
//             | MSO Management
//             |--------------------------------------------------------------------------
//             */
//             'mso.list.view',
//             'mso.create',
//             'mso.update',
//             'mso.delete',

//             // MSO Profile – View
//             'mso.profile.general.view',
//             'mso.profile.qualification.view',
//             'mso.profile.employment.view',
//             'mso.profile.family.view',
//             'mso.profile.pension-and-payment.view',
//             'mso.profile.edit-request.view',

//             // MSO Profile – Management
//             'mso.profile.edit-request.create',
//             'mso.profile.edit-request.response',
//             'mso.profile.verify',
//             'mso.profile.confirm',
//             'mso.profile.id.view',
//             'mso.profile.pdf.view',

//             // MSO Profile – Actions
//             'mso.bulk.upload',

//             'mso.profile.personal-cultural.update',
//             'mso.profile.health.update',
//             'mso.profile.contact-information.update',
//             'mso.profile.location-information.update',
//             'mso.profile.temporary-location-information.update',

//             'mso.profile.qualification.create',
//             'mso.profile.qualification.delete',

//             'mso.profile.employment.current-appointment.update',
//             'mso.profile.employment.first-appointment.update',
//             'mso.profile.employment.mso-information.update',
//             'mso.profile.employment.previous-service.create',
//             'mso.profile.employment.previous-service.delete',
//             'mso.profile.employment.services-history.create',
//             'mso.profile.employment.services-history.delete',

//             'mso.profile.pension-and-payment.update',
            
//             'mso.profile.family.create',
//             'mso.profile.family.delete',


//             /*
//             |--------------------------------------------------------------------------
//             | SLEAS Management
//             |--------------------------------------------------------------------------
//             */
//             'sleas.list.view',
//             'sleas.create',
//             'sleas.update',
//             'sleas.delete',

//             // SLEAS Profile – View
//             'sleas.profile.general.view',
//             'sleas.profile.qualification.view',
//             'sleas.profile.employment.view',
//             'sleas.profile.family.view',
//             'sleas.profile.pension-and-payment.view',
//             'sleas.profile.edit-request.view',

//             // SLEAS Profile – Management
//             'sleas.profile.edit-request.create',
//             'sleas.profile.edit-request.response',
//             'sleas.profile.verify',
//             'sleas.profile.confirm',
//             'sleas.profile.id.view',
//             'sleas.profile.pdf.view',

//             // SLEAS Profile – Actions
//             'sleas.bulk.upload',

//             'sleas.profile.personal-cultural.update',
//             'sleas.profile.health.update',
//             'sleas.profile.contact-information.update',
//             'sleas.profile.location-information.update',
//             'sleas.profile.temporary-location-information.update',

//             'sleas.profile.qualification.create',
//             'sleas.profile.qualification.delete',

//             'sleas.profile.employment.current-appointment.update',
//             'sleas.profile.employment.first-appointment.update',
//             'sleas.profile.employment.sleas-information.update',
//             'sleas.profile.employment.previous-service.create',
//             'sleas.profile.employment.previous-service.delete',
//             'sleas.profile.employment.services-history.create',
//             'sleas.profile.employment.services-history.delete',

//             'sleas.profile.pension-and-payment.update',
            
//             'sleas.profile.family.create',
//             'sleas.profile.family.delete',

//             /*
//             |--------------------------------------------------------------------------
//             | SLTAS Management
//             |--------------------------------------------------------------------------
//             */
//             'sltas.list.view',
//             'sltas.create',
//             'sltas.update',
//             'sltas.delete',

//             // SLTAS Profile – View
//             'sltas.profile.general.view',
//             'sltas.profile.qualification.view',
//             'sltas.profile.employment.view',
//             'sltas.profile.family.view',
//             'sltas.profile.pension-and-payment.view',
//             'sltas.profile.edit-request.view',

//             // SLTAS Profile – Management
//             'sltas.profile.edit-request.create',
//             'sltas.profile.edit-request.response',
//             'sltas.profile.verify',
//             'sltas.profile.confirm',
//             'sltas.profile.id.view',
//             'sltas.profile.pdf.view',

//             // SLTAS Profile – Actions
//             'sltas.bulk.upload',

//             'sltas.profile.personal-cultural.update',
//             'sltas.profile.health.update',
//             'sltas.profile.contact-information.update',
//             'sltas.profile.location-information.update',
//             'sltas.profile.temporary-location-information.update',

//             'sltas.profile.qualification.create',
//             'sltas.profile.qualification.delete',

//             'sltas.profile.employment.current-appointment.update',
//             'sltas.profile.employment.first-appointment.update',
//             'sltas.profile.employment.sltas-information.update',
//             'sltas.profile.employment.previous-service.create',
//             'sltas.profile.employment.previous-service.delete',
//             'sltas.profile.employment.services-history.create',
//             'sltas.profile.employment.services-history.delete',

//             'sltas.profile.pension-and-payment.update',
            
//             'sltas.profile.family.create',
//             'sltas.profile.family.delete',

//             /*
//             |--------------------------------------------------------------------------
//             | SLTES Management
//             |--------------------------------------------------------------------------
//             */
//             'sltes.list.view',
//             'sltes.create',
//             'sltes.update',
//             'sltes.delete',

//             // SLTES Profile – View
//             'sltes.profile.general.view',
//             'sltes.profile.qualification.view',
//             'sltes.profile.employment.view',
//             'sltes.profile.family.view',
//             'sltes.profile.pension-and-payment.view',
//             'sltes.profile.edit-request.view',

//             // SLTES Profile – Management
//             'sltes.profile.edit-request.create',
//             'sltes.profile.edit-request.response',
//             'sltes.profile.verify',
//             'sltes.profile.confirm',
//             'sltes.profile.id.view',
//             'sltes.profile.pdf.view',

//             // SLTES Profile – Actions
//             'sltes.bulk.upload',

//             'sltes.profile.personal-cultural.update',
//             'sltes.profile.health.update',
//             'sltes.profile.contact-information.update',
//             'sltes.profile.location-information.update',
//             'sltes.profile.temporary-location-information.update',

//             'sltes.profile.qualification.create',
//             'sltes.profile.qualification.delete',

//             'sltes.profile.employment.current-appointment.update',
//             'sltes.profile.employment.first-appointment.update',
//             'sltes.profile.employment.sltes-information.update',
//             'sltes.profile.employment.previous-service.create',
//             'sltes.profile.employment.previous-service.delete',
//             'sltes.profile.employment.services-history.create',
//             'sltes.profile.employment.services-history.delete',

//             'sltes.profile.pension-and-payment.update',
            
//             'sltes.profile.family.create',
//             'sltes.profile.family.delete',

//             /*
//             |--------------------------------------------------------------------------
//             | SLAS Management
//             |--------------------------------------------------------------------------
//             */
//             'slas.list.view',
//             'slas.create',
//             'slas.update',
//             'slas.delete',

//             // SLAS Profile – View
//             'slas.profile.general.view',
//             'slas.profile.qualification.view',
//             'slas.profile.employment.view',
//             'slas.profile.family.view',
//             'slas.profile.pension-and-payment.view',
//             'slas.profile.edit-request.view',

//             // SLAS Profile – Management
//             'slas.profile.edit-request.create',
//             'slas.profile.edit-request.response',
//             'slas.profile.verify',
//             'slas.profile.confirm',
//             'slas.profile.id.view',
//             'slas.profile.pdf.view',

//             // SLAS Profile – Actions
//             'slas.bulk.upload',

//             'slas.profile.personal-cultural.update',
//             'slas.profile.health.update',
//             'slas.profile.contact-information.update',
//             'slas.profile.location-information.update',
//             'slas.profile.temporary-location-information.update',

//             'slas.profile.qualification.create',
//             'slas.profile.qualification.delete',

//             'slas.profile.employment.current-appointment.update',
//             'slas.profile.employment.first-appointment.update',
//             'slas.profile.employment.slas-information.update',
//             'slas.profile.employment.previous-service.create',
//             'slas.profile.employment.previous-service.delete',
//             'slas.profile.employment.services-history.create',
//             'slas.profile.employment.services-history.delete',

//             'slas.profile.pension-and-payment.update',
            
//             'slas.profile.family.create',
//             'slas.profile.family.delete',


//             /*
//             |--------------------------------------------------------------------------
//             | SLAcS Management
//             |--------------------------------------------------------------------------
//             */
//             'slacs.list.view',
//             'slacs.create',
//             'slacs.update',
//             'slacs.delete',

//             // SLAcS Profile – View
//             'slacs.profile.general.view',
//             'slacs.profile.qualification.view',
//             'slacs.profile.employment.view',
//             'slacs.profile.family.view',
//             'slacs.profile.pension-and-payment.view',
//             'slacs.profile.edit-request.view',

//             // SLAcS Profile – Management
//             'slacs.profile.edit-request.create',
//             'slacs.profile.edit-request.response',
//             'slacs.profile.verify',
//             'slacs.profile.confirm',
//             'slacs.profile.id.view',
//             'slacs.profile.pdf.view',

//             // SLAcS Profile – Actions
//             'slacs.bulk.upload',

//             'slacs.profile.personal-cultural.update',
//             'slacs.profile.health.update',
//             'slacs.profile.contact-information.update',
//             'slacs.profile.location-information.update',
//             'slacs.profile.temporary-location-information.update',

//             'slacs.profile.qualification.create',
//             'slacs.profile.qualification.delete',

//             'slacs.profile.employment.current-appointment.update',
//             'slacs.profile.employment.first-appointment.update',
//             'slacs.profile.employment.slacs-information.update',
//             'slacs.profile.employment.previous-service.create',
//             'slacs.profile.employment.previous-service.delete',
//             'slacs.profile.employment.services-history.create',
//             'slacs.profile.employment.services-history.delete',

//             'slacs.profile.pension-and-payment.update',
            
//             'slacs.profile.family.create',
//             'slacs.profile.family.delete',


//             /*
//             |--------------------------------------------------------------------------
//             | User Management
//             |--------------------------------------------------------------------------
//             */
            'user.list.view',
//             'user.create',
//             'user.update',
            'user.password.reset',
            'user.status.update',
//             'user.delete',
//             'user.edit',


//             /*
//             |--------------------------------------------------------------------------
//             | Institution Management
//             |--------------------------------------------------------------------------
//             */
//             'institution.list.view',
//             'institution.create',
//             'institution.update',

//             'institution.profile.view',
//             'institution.profile.overview.view',
//             'institution.profile.staff.view',
//             'institution.profile.report-module.view',
//             'institution.profile.report-module.pdf',
//             'institution.profile.report-module.xls',

//             'institution.basic_information.update',
//             'institution.contact_details.update',
//             'institution.location_administration.update',
//             'institution.mission_vision.update',


//             "institution.view.create",
//             "institution.view.profile",
//             "institution.view",

//             /*
//             |--------------------------------------------------------------------------
//             | Appointment Subject Management
//             |--------------------------------------------------------------------------
//             */
//             'appointment_subject.list.view',
//             'appointment_subject.create',
//             'appointment_subject.update',
//             'appointment_subject.delete',
//             'appointment_subject.view',


//             "appointment_subject.create",
//             "appointment_subject.delete",
//             "appointment_subject.update",
//             "appointment_subject.view",
//             "appointment_subject.list.view",


//             /*
//             |--------------------------------------------------------------------------
//             | Teaching Subject Management
//             |--------------------------------------------------------------------------
//             */
//             'teaching_subject.list.view',
//             'teaching_subject.create',
//             'teaching_subject.update',
//             'teaching_subject.delete',
//             'teaching_subject.view',



//             /*
//             |--------------------------------------------------------------------------
//             | School Management
//             |--------------------------------------------------------------------------
//             */

//             "school.view",
//             "teacher.view",
//             "principal.view",
//             "schooldeo.view",
//             "schoolclerk.view",
//             "teacher.bulk.upload",
//             "teacher.create",
//             "teacher.delete",
//             "teacher.profile.confirm",
//             "teacher.profile.view",
//             "teacher.update",
//             "teacher.profile.printid",
//             "teacher.profile.exportpdf",



//             /*
//             |--------------------------------------------------------------------------
//             | Office Management (MOE / PMOE / PEO / ZEO / DEO)
//             |--------------------------------------------------------------------------
//             */
//             // Lists
//             'office.moe.list.view',
//             'office.pmoe.list.view',
//             'office.peo.list.view',
//             'office.zeo.list.view',
//             'office.deo.list.view',
//             'office.institution.list.view',

//             // Create
//             'office.moe.create',
//             'office.pmoe.create',
//             'office.peo.create',
//             'office.zeo.create',
//             'office.deo.create',
//             'office.institution.create',

//             // Profile
//             'office.moe.profile.overview.view',
//             'office.pmoe.profile.overview.view',
//             'office.peo.profile.overview.view',
//             'office.zeo.profile.overview.view',
//             'office.deo.profile.overview.view',

//             // Update
//             'office.moe.update',
//             'office.pmoe.update',
//             'office.peo.update',
//             'office.zeo.update',
//             'office.deo.update',
//             'office.institution.update',

//             // Delete
//             'office.moe.delete',
//             'office.pmoe.delete',
//             'office.peo.delete',
//             'office.zeo.delete',
//             'office.deo.delete',
//             'office.institution.delete',

//             // institution profile
//             'office.institution.profile.overview.view',
//             'office.institution.profile.profile.view',
//             'office.institution.profile.staff.view',
//             'office.institution.profile.report-module.view',
//             'office.institution.profile.report-module.pdf',
//             'office.institution.profile.report-module.xls',


//             "office.overview",
//             "office.moe",
//             "office.zeo",
//             "office.deo",
//             "office.pmoe",
//             "office.peo",
//             "office.moe.profile.view",
//             "office.zeo.profile.view",
//             "office.deo.profile.view",
//             "office.pmoe.profile.view",
//             "office.zeo.create",
//             "office.deo.create",

//             // Cadre DMS Approved
//             'cadre-dms-approved.index.view',
//             'cadre-dms-approved.add',
//             'cadre-dms-approved.institution.view',
//             'cadre-dms-approved.edit',

//             'institution.profile.cadre-dms-approved.view',
//             'office.institution.profile.cadre-dms-approved.view',

//             'alerts.overview.view',

//             // Alters 

//             "alerts.view",
//             "alerts.view.profile",

//             // Division Management
//             "division.view",

//             //Provincial Management
//             "provincial.view",

//             //MOE
//             "moe.view",

//             //Index
//             "inbox.overview.view",

//             //Admin User Management
//             "admin.overview.view",

//             //Timetable Management
//             "timetable.overview.view",

//             //Zonal Management

//             "zonal.view",
//             "zonaladmin.view",
//             "zonaldeo.view",




//             "menu.alerts",
//     "alerts.profile.view",
//     "alerts.profile-verify.view",
//    "alerts.profile-revise.view",
//     "alerts.profile-confirm.view",
//     "alerts.profile-reject.view",

//    "menu.roles",
//     "roles.create",
//     "roles.edit",
//     "roles.delete",


// "menu.maintable",

//    "menu.attendance",
//      "attendance.manage.update",


//      "cadre-dms-approved.add",
//      "cadre-dms-approved.edit",
//     "menu.approved-cader",

  
//      "menu.dashboard",
//      "dashboard.myprofile",
//     "dashboard.calendar",
//     "dashboard.analytics",
//     "dashboard.geographic-moreview",


//      "dos.bulk.upload",
//    "dos.create",
// "dos.delete",
//   "menu.dos",
//     "dos.profile.confirm",
//   "dos.update",
//     "dos.profile.verify",

//   "institution.create",
//     "institution.profile.view",
//     "menu.institution",
//     "institution.profile.report-module.pdf",
//      "institution.basic_information.update",
 
   

//     "mso.bulk.upload",
//      "mso.create",
//     "mso.delete",
//      "menu.mso",
//    "mso.update",

//   "my-profile.view",
//     "my-profile.update",
//      "my-profile.verify",

//    "menu.office",
//      "menu.office.overview",
//     "menu.office.moe",
//     "menu.office.zeo",
//     "menu.office.deo",
//     "menu.office.pmoe",
//     "menu.office.peo",
  


//      "principal.bulk.upload",
//     "principal.create",
//     "principal.delete",
//     "menu.schools.principals",
//     "principal.update",
//     "principal.profile.view",
//    "principal.profile.edit.view",
//    "principal.profile.edit-request.view",
//     "principal.profile.qualification.view",
//     "principal.profile.employment.view",
//     "principal.profile.employment.previous-service.create",
//     "principal.profile.employment.previous-record.view",
//      "principal.profile.pension-and-payment.update",
//    "principal.profile.family.create",


//  "menu.students",

//     "menu.schools",
//     "menu.schools.teachers",
//    "menu.schools.principals",
//    "menu.schools.deo",
//     "menu.schools.clerk",
//      "teacher.bulk.upload",
//     "teacher.create",
//      "teacher.delete",
//     "teacher.profile.confirm",
//     "teacher.profile.view",
//     "teacher.update",
//     "teacher.profile.printid",
//    "teacher.profile.exportpdf",
//     "teacher.profile.promote",
//     "teacher.profile.edit-request.view",
//     "teacher.profile.edit.view",
//     "teacher.profile.qualification.view",
//     "teacher.profile.employment.view",
//      "teacher.profile.employment.previous-service.create",
//     "teacher.profile.employment.previous-record.view",
//     "teacher.profile.pension-and-payment.update",
//     "teacher.profile.family.create",
  
    
// "menu.division",

// "menu.zonal",
//    "menu.zonal.admin",
//     "menu.zonal.deo",
//     "zonal.create",
//     "zonal.profile.view",


//  "menu.provincial",
 
//  "menu.moe",

//   "user.create",
//    "user.delete",
//    "user.edit",
//      "menu.users",
//      "user.update",

//  "menu.inbox",
    
//  "menu.admin",

//   "menu.timetable",

//   "menu.settings.system-settings",
//     "menu.settings.version",
//     "menu.settings.notifications",
//     "menu.settings.privacy",
//     "settings.version.add",
//     "settings.version.delete",
//    "settings.version.edit",
         



       
        'menu.alerts',
        'alerts.profile.view',
        'alerts.profile.verify',
        'alerts.profile.revise',
        'alerts.profile.confirm',
        'alerts.profile.reject',


        'menu.roles',
        'roles.create',
        'roles.edit',
        'roles.delete',


        'menu.maintable',


        'menu.attendance',
        'attendance.manage.update',


        'cadre.dms.approved.add',
        'cadre.dms.approved.edit',
        'menu.approved.cadre',


        'menu.dashboard',
        'dashboard.myprofile',
        'dashboard.calendar',
        'dashboard.analytics',
        'dashboard.geographic.moreview',


        'dos.bulk.upload',
        'dos.create',
        'dos.delete',
        'menu.dos',
        'dos.profile.confirm',
        'dos.update',
        'dos.profile.verify',


        'institution.create',
        'institution.profile.view',
        'menu.institution',
        'institution.profile.report.module.pdf',
        'institution.basic.information.update',


        'mso.bulk.upload',
        'mso.create',
        'mso.delete',
        'menu.mso',
        'mso.update',


        'my.profile.view',
        'my.profile.update',
        'my.profile.verify',

        'menu.division.admin',
        'menu.division.deo',

        'menu.office',
        'menu.office.overview',
        'menu.office.moe',
        'menu.office.zeo',
        'menu.office.deo',
        'menu.office.pmoe',
        'menu.office.peo',

        'principal.bulk.upload',
        'principal.create',
        'principal.delete',
        'menu.schools.principals',
        'principal.update',
        'principal.profile.view',
        'principal.profile.edit.view',
        'principal.profile.edit.request.view',
        'principal.profile.qualification.view',
        'principal.profile.employment.view',
        'principal.profile.employment.previous.service.create',
        'principal.profile.employment.previous.record.view',
        'principal.profile.pension.and.payment.update',
        'principal.profile.family.create',


        'menu.students',
        'menu.schools',
        'menu.schools.teachers',
        'menu.schools.principals',
        'menu.schools.deo',
        'menu.schools.clerk',
        'teacher.bulk.upload',
        'teacher.create',
        'teacher.delete',
        'teacher.profile.confirm',
        'teacher.profile.view',
        'teacher.update',
        'teacher.profile.printid',
        'teacher.profile.exportpdf',
        'teacher.profile.promote',
        'teacher.profile.edit.request.view',
        'teacher.profile.edit.view',
        'teacher.profile.qualification.view',
        'teacher.profile.employment.view',
        'teacher.profile.employment.previous.service.create',
        'teacher.profile.employment.previous.record.view',
        'teacher.profile.pension.and.payment.update',
        'teacher.profile.family.create',


        'menu.division',
        'division.admin.create',
        'division.admin.profile.view',
        'division.deo.create',
        'division.deo.profile.view',


        'menu.zonal',
        'menu.zonal.admin',
        'menu.zonal.deo',
        'zonal.admin.create',
        'zonal.admin.bulk.upload',
        'zonal.admin.profile.view',
        'zonal.admin.profile.edit',
        'zonal.admin.profile.exportpdf',
        'zonal.admin.service.add',
        'zonal.admin.qualification.add',
        'zonal.admin.wop.edit',
        'zonal.admin.family.add',
        'zonal.deo.create',
        'zonal.deo.bulk.upload',
        'zonal.deo.profile.view',
        'zonal.deo.profile.exportpdf',
        'zonal.deo.qualification.add',
        'zonal.deo.service.add',
        'zonal.deo.wop.edit',
        'zonal.deo.family.add',


        'menu.provincial',
        'menu.provincial.admin',
        'menu.provincial.deo',
        'provincial.admin.create',
        'provincial.admin.bulk.upload',
        'provincial.admin.profile.view',
        'provincial.admin.profile.edit',
        'provincial.admin.profile.exportpdf',
        'provincial.admin.service.add',
        'provincial.admin.qualification.add',
        'provincial.admin.wop.edit',
        'provincial.admin.family.add',
        'provincial.deo.create',
        'provincial.deo.bulk.upload',
        'provincial.deo.profile.view',
        'provincial.deo.profile.edit',
        'provincial.deo.profile.exportpdf',
        'provincial.deo.qualification.add',
        'provincial.deo.service.add',
        'provincial.deo.wop.edit',
        'provincial.deo.family.add',
        'menu.moe',
        'menu.moe.admin',
        'moe.admin.create',
        'moe.admin.bulk.upload',
        'moe.admin.profile.view',
        'moe.admin.profile.exportpdf',
        'moe.admin.service.add',
        'moe.admin.qualification.add',
        'moe.admin.wop.edit',
        'moe.admin.family.add',


        'user.create',
        'user.delete',
        'user.edit',
        'menu.user',
        'user.update',


        'menu.inbox',
        'menu.admin',
        'menu.timetable',

        'my.profile.document.pdf',
        'my.profile.general.edit',
        'my.profile.qualification.add',
        'my.profile.employment.edit',
        'my.profile.w&op.edit',


        'menu.settings.system.settings',
        'menu.settings.version',
        'menu.settings.notifications',
        'menu.settings.privacy',
        'settings.version.add',
        'settings.version.delete',
        'settings.version.edit',
        ];


        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Super Admin role and give all permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'super admin']);
        $superAdminRole->level = 1;
        $superAdminRole->save();
        $superAdminRole->syncPermissions(Permission::all());


        // Create Admin , MOE Director& MOE Administrator role and give similar permission to SA with minor restrictions

        foreach (['admin' => 2, 'MOE Administrator' => 2, 'MOE Director' => 2] as $roleName => $level) {
            $role  = Role::firstOrCreate(['name' => $roleName]);
            $role->level = $level;
            $role->save();
            $role->syncPermissions(Permission::all());
        }

        // Zonal Director & Zonal Deputy Director — Approve/View
        // Coordinates school-level HR; validates qualifications, attendance, leave records
        $zonalApproveViewPermissions = [
            'menu.dashboard',
            'dashboard.analytics',
            'menu.schools',
            'menu.schools.teachers',
            'menu.schools.principals',
            'teacher.profile.view',
            'teacher.profile.confirm',
            'teacher.profile.exportpdf',
            'teacher.profile.qualification.view',
            'teacher.profile.employment.view',
            'principal.profile.view',
            'principal.profile.qualification.view',
            'principal.profile.employment.view',
            'menu.attendance',
            'attendance.manage.update',
            'menu.alerts',
            'alerts.profile.view',
            'alerts.profile.verify',
            'alerts.profile.confirm',
            'alerts.profile.reject',
            'menu.zonal',
            'menu.zonal.admin',
            'menu.zonal.deo',
            'zonal.admin.profile.view',
            'zonal.admin.profile.edit',
            'zonal.deo.create',
            'zonal.deo.bulk.upload',
            'zonal.deo.profile.view',
            'zonal.deo.profile.exportpdf',
            'zonal.deo.qualification.add',
            'zonal.deo.service.add',
            'zonal.deo.wop.edit',
            'zonal.deo.family.add',
        ];

        // provincial director permissions — view only, no verify/confirm/reject
        $provincialViewPermissions = array_values(array_filter($zonalApproveViewPermissions, fn ($perm) => ! in_array($perm, [
            'teacher.profile.confirm',
            'alerts.profile.verify',
            'alerts.profile.confirm',
            'alerts.profile.reject',
        ])));

        $provincialViewPermissions = array_merge($provincialViewPermissions, [
            'zonal.admin.create',
            'zonal.admin.bulk.upload',
            'zonal.admin.profile.exportpdf',
            'zonal.admin.service.add',
            'zonal.admin.qualification.add',
            'zonal.admin.wop.edit',
            'zonal.admin.family.add',
            'menu.provincial',
            'menu.provincial.admin',
            'menu.provincial.deo',
            'provincial.admin.profile.view',
            'provincial.admin.profile.edit',
            'provincial.deo.profile.view',
            'provincial.deo.profile.edit',
            'menu.settings.system.settings',
            'menu.settings.version',
            'menu.settings.notifications',
            'menu.settings.privacy',
            'settings.version.add',
            'settings.version.delete',
            'settings.version.edit',
        ]);

        foreach (['Provincial Director' => 3, 'Provincial Deputy Director' => 3, 'Provincial Subject Head' => 3] as $roleName => $level) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->level = $level;
            $role->save();
            $role->syncPermissions($provincialViewPermissions);
        }
        

       
        
        

        foreach (['Zonal Director' => 5, 'Zonal Deputy Director' => 6] as $roleName => $level) {
            $role        = Role::firstOrCreate(['name' => $roleName]);
            $role->level = $level;
            $role->save();
            $role->syncPermissions($zonalApproveViewPermissions);
        }


        // Zonal DEO HEAD & Zonal DEO — Full CRUD access to personnel details
        $zonalDeoPermissions = [
            'menu.dashboard',
            'dashboard.analytics',
            'menu.schools',
            'menu.schools.teachers',
            'menu.schools.principals',
            'menu.schools.deo',
            'teacher.bulk.upload',
            'teacher.create',
            'teacher.update',
            'teacher.delete',
            'teacher.profile.view',
            'teacher.profile.confirm',
            'teacher.profile.printid',
            'teacher.profile.exportpdf',
            'teacher.profile.promote',
            'teacher.profile.edit.view',
            'teacher.profile.edit.request.view',
            'teacher.profile.qualification.view',
            'teacher.profile.employment.view',
            'teacher.profile.employment.previous.service.create',
            'teacher.profile.employment.previous.record.view',
            'teacher.profile.pension.and.payment.update',
            'teacher.profile.family.create',
            'principal.bulk.upload',
            'principal.create',
            'principal.update',
            'principal.delete',
            'principal.profile.view',
            'principal.profile.edit.view',
            'principal.profile.edit.request.view',
            'principal.profile.qualification.view',
            'principal.profile.employment.view',
            'principal.profile.employment.previous.service.create',
            'principal.profile.employment.previous.record.view',
            'principal.profile.pension.and.payment.update',
            'principal.profile.family.create',
            'menu.attendance',
            'attendance.manage.update',
            'menu.alerts',
            'alerts.profile.view',
            'alerts.profile.verify',
            'alerts.profile.confirm',
            'alerts.profile.revise',
            'alerts.profile.reject',
            'menu.zonal',
            'menu.zonal.admin',
            'menu.zonal.deo',
            'zonal.admin.create',
            'zonal.admin.bulk.upload',
            'zonal.admin.profile.view',
            'zonal.admin.profile.edit',
            'zonal.admin.profile.exportpdf',
            'zonal.admin.service.add',
            'zonal.admin.qualification.add',
            'zonal.admin.wop.edit',
            'zonal.admin.family.add',
            'zonal.deo.create',
            'zonal.deo.bulk.upload',
            'zonal.deo.profile.view',
            'zonal.deo.profile.exportpdf',
            'zonal.deo.qualification.add',
            'zonal.deo.service.add',
            'zonal.deo.wop.edit',
            'zonal.deo.family.add',
        ];


         // provincial DEO same permissions as zonal DEO + provincial permissions
        $provincialDeoPermissionsList = array_merge($zonalDeoPermissions, [
            'menu.provincial',
            'menu.provincial.admin',
            'menu.provincial.deo',
            'provincial.admin.create',
            'provincial.admin.profile.view',
            'provincial.admin.service.add',
            'provincial.admin.qualification.add',
            'provincial.admin.wop.edit',
            'provincial.admin.family.add',
            'provincial.deo.create',
            'provincial.deo.profile.view',
            'provincial.deo.qualification.add',
            'provincial.deo.service.add',
            'provincial.deo.wop.edit',
            'provincial.deo.family.add',
        ]);

        foreach (['Provincial DEO' => 4, 'Provincial Clerk (DEO)' => 4] as $roleName => $level) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->level = $level;
            $role->save();
            $role->syncPermissions($provincialDeoPermissionsList);
        }
        
            $role        = Role::firstOrCreate(['name' => 'Zonal DEO']);
            $role->level = 7;
            $role->save();
            $role->syncPermissions($zonalDeoPermissions);

            $role        = Role::firstOrCreate(['name' => 'Divisional Head']);
            $role->level = 8;
            $role->save();
            $role->syncPermissions($zonalApproveViewPermissions);

            $role        = Role::firstOrCreate(['name' => 'Divisional DEO']);
            $role->level = 9;
            $role->save();
            $role->syncPermissions($zonalDeoPermissions);

            
        // Create Teacher role — Individual: view own profile/personnel details
        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);
        $teacherRole->level = 10;
        $teacherRole->save();
        $teacherRole->syncPermissions([
            'menu.dashboard',
            'dashboard.myprofile',
            'my.profile.view',
        ]);

        // Create principal role — School: view teacher details, generate reports
        $principalRole = Role::firstOrCreate(['name' => 'principal']);
        $principalRole->level = 11;
        $principalRole->save();
        $principalRole->syncPermissions([
            'menu.dashboard',
            'dashboard.analytics',
            'menu.schools',
            'menu.schools.teachers',
            'teacher.profile.view',
            'teacher.profile.exportpdf',
            'teacher.profile.qualification.view',
            'teacher.profile.employment.view',
            'institution.profile.view',
            'institution.profile.report.module.pdf',
        ]);

        // Create school deo role — Individual: view own profile/personnel details
        $teacherRole = Role::firstOrCreate(['name' => 'School DEO']);
        $teacherRole->level = 12;
        $teacherRole->save();
        $teacherRole->syncPermissions([
            'menu.dashboard',
            'dashboard.myprofile',
            'my.profile.view',
        ]);

    }
}