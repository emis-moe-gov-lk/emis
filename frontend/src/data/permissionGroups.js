export const PermissionGroups = {
  ALERTS: {
    ALERT_VIEW: "menu.alerts",
    PROFILE_VIEW: "alerts.profile.view",
    PROFILE_VERIFY: "alerts.profile-verify.view",
    PROFILE_REVISE: "alerts.profile-revise.view",
    PROFILE_CONFIRM: "alerts.profile-confirm.view",
    PROFILE_REJECT: "alerts.profile-reject.view"



  },

  ROLES: {
    ROLES_VIEW: "menu.roles",
    ROLES_CREATE: "roles.create",
    ROLES_EDIT: "roles.edit",
    ROLES_DELETE: "roles.delete",
  },

  MAINTABLE: {
    MAINTABLE_VIEW: "menu.maintable",


  },


  ATTENDANCE: {
    ATTENDANCE_VIEW: "menu.attendance",
    MANAGE_UPDATE: "attendance.manage.update",
  },

  CADRE_DMS_APPROVED: {
    ADD: "cadre-dms-approved.add",
    EDIT: "cadre-dms-approved.edit",
    CADER_VIEW: "menu.approved-cader",
  },

  DASHBOARD: {
    DASHBOARD_VIEW: "menu.dashboard",
    VIEW_MYPROFILE: "dashboard.myprofile",
    VIEW_CALENDAR: "dashboard.calendar",
    VIEW_ANALYTICS: "dashboard.analytics",
    GEOGRAPHIC_MORE: "dashboard.geographic-moreview",
  },

  DOS: {
    BULK_UPLOAD: "dos.bulk.upload",
    CREATE: "dos.create",
    DELETE: "dos.delete",
    DOS_VIEW: "menu.dos",
    CONFIRM: "dos.profile.confirm",
    UPDATE: "dos.update",
    VERIFY: "dos.profile.verify",
  },


  INSTITUTION: {
    CREATE: "institution.create",
    PROFILE_VIEW: "institution.profile.view",
    INSTITUTION_VIEW: "menu.institution",
    PROFILE_REPORT: "institution.profile.report-module.pdf",
    PROFILE_EDIT: "institution.basic_information.update",
    

  },

  MSO: {
    BULK_UPLOAD: "mso.bulk.upload",
    CREATE: "mso.create",
    DELETE: "mso.delete",
    MSO_VIEW: "menu.mso",
    UPDATE: "mso.update",
  },

  MY_PROFILE: {
    VIEW: "my.profile.view",
    UPDATE: "my.profile.update",
    VERIFY: "my.profile.verify",
    DOCUMENT: "my.profile.document.pdf",
    GENERAL_EDIT: "my.profile.general.edit",
    QUALIFICATION_ADD: "my.profile.qualification.add",
    EMPLOYMENT_EDIT: "my.profile.employment.edit",
    WOP_EDIT: "my.profile.w&op.edit",
  },

  OFFICE: {
    OFFICE_VIEW: "menu.office",
    OVERVIEW_VIEW: "menu.office.overview",
    MOE_LIST_VIEW: "menu.office.moe",
    ZEO_LIST_VIEW: "menu.office.zeo",
    DEO_LIST_VIEW: "menu.office.deo",
    PMOE_LIST_VIEW: "menu.office.pmoe",
    PE_LIST_VIEW: "menu.office.peo",
    // MOE_PROFILE_VIEW: "office.moe.profile.view",
    // ZEO_PROFILE_VIEW: "office.zeo.profile.view",
    // DEO_PROFILE_VIEW: "office.deo.profile.view",
    // PMOE_PROFILE_VIEW: "office.pmoe.profile.view",
    // ZEO_CREATE: "office.zeo.create",
    // DEO_CREATE: "office.deo.create",
    
  },

  PRINCIPAL: {
    BULK_UPLOAD: "principal.bulk.upload",
    CREATE: "principal.create",
    DELETE: "principal.delete",
    PRINCIPAL_VIEW: "menu.schools.principals",
    UPDATE: "principal.update",
    PROFILE_VIEW: "principal.profile.view",
    PROFILE_EDIT: "principal.profile.edit.view",
    EDIT_REQUEST: "principal.profile.edit-request.view",
    PROFILE_QUALIFICATION: "principal.profile.qualification.view",
    PROFILE_EMPLOYMENT: "principal.profile.employment.view",
    PROFILE_PREVIOUS_SERVICE: "principal.profile.employment.previous-service.create",
    PROFILE_PREVIOUS_RECORD: "principal.profile.employment.previous-record.view",
    PROFILE_WOP: "principal.profile.pension-and-payment.update",
    PROFILE_FAMILY: "principal.profile.family.create"



  },

  

  // SLAS: {
  //   CREATE: "slas.create",
  //   DELETE: "slas.delete",
  //   LIST_VIEW: "slas.list.view",
  //   UPDATE: "slas.update",
  // },

  // SLEAS: {
  //   CREATE: "sleas.create",
  //   DELETE: "sleas.delete",
  //   LIST_VIEW: "sleas.list.view",
  //   UPDATE: "sleas.update",
  // },

  // SLTES: {
  //   CREATE: "sltes.create",
  //   DELETE: "sltes.delete",
  //   LIST_VIEW: "sltes.list.view",
  //   UPDATE: "sltes.update",
  // },

  STUDENT: {
    STUDENT_VIEW: "menu.students",
  },

  // TEACHER: {
  //   BULK_UPLOAD: "teacher.bulk.upload",
  //   CREATE: "teacher.create",
  //   DELETE: "teacher.delete",
  //   // LIST_VIEW: "teacher.list.view",
  //   CONFIRM: "teacher.profile.confirm",
  //   VIEW: "teacher.profile.view",
  //   UPDATE: "teacher.update",
  // },

  SCHOOLS: {
    SCHOOLS_VIEW: "menu.schools",
    TEACHER: "menu.schools.teachers",
    PRINCIPAL: "menu.schools.principals",
    DEO: "menu.schools.deo",
    BULK_UPLOAD: "teacher.bulk.upload",
    CREATE: "teacher.create",
    DELETE: "teacher.delete",
    CONFIRM: "teacher.profile.confirm",
    VIEW_PROFILE: "teacher.profile.view",
    UPDATE: "teacher.update",
    PRINT_ID: "teacher.profile.printid",
    EXPORT_PDF: "teacher.profile.exportpdf",
    PROMOTE: "teacher.profile.promote",
    EDIT_REQUEST: "teacher.profile.edit-request.view",
    PROFILE_EDIT: "teacher.profile.edit.view",
    PROFILE_QUALIFICATION: "teacher.profile.qualification.view",
    PROFILE_EMPLOYMENT: "teacher.profile.employment.view",
    PROFILE_PREVIOUS_SERVICE: "teacher.profile.employment.previous-service.create",
    PROFILE_PREVIOUS_RECORD: "teacher.profile.employment.previous-record.view",
    PROFILE_WOP: "teacher.profile.pension-and-payment.update",
    PROFILE_FAMILY: "teacher.profile.family.create"


  },

  DIVISION: {
    DIVISION_VIEW: "menu.division",
    ADMIN_VIEW: "menu.division.admin",
    DEO_VIEW: "menu.division.deo",
    ADMIN_CREATE: "division.admin.create",
    ADMIN_PROFILE_VIEW: "division.admin.profile.view",
    DEO_CREATE: "division.deo.create",
    DEO_PROFILE_VIEW: "division.deo.profile.view",
  },

  ZONAL: {
    ZONAL_VIEW: "menu.zonal",
    ADMIN: "menu.zonal.admin",
    DEO: "menu.zonal.deo",
    ADMIN_CREATE: "zonal.admin.create",
    ADMIN_BULK_UPLOAD: "zonal.admin.bulk-upload",
    ADMIN_PROFILE_VIEW:   "zonal.admin.profile.view",
    ADMIN_PROFILE_EDIT:   "zonal.admin.profile.edit",
    ADMIN_DOCUMENTS:      "zonal.admin.profile.exportpdf",
    ADMIN_PROFILE: "zonal.admin.profile.view",
    ADMIN_SERVICES: "zonal.admin.service.add",
    ADMIN_QUALIFICATIONS: "zonal.admin.qualification.add",
    ADMIN_WOP: "zonal.admin.w&op.edit",
    ADMIN_FAMILY: "zonal.admin.family.add",
    DEO_CREATE: "zonal.deo.create",
    DEO_BULK_UPLOAD: "zonal.deo.bulk-upload",
    DEO_PROFILE_VIEW: "zonal.deo.profile.view",
    DEO_PROFILE_EXPORTPDF: "zonal.deo.profile.exportpdf",
    DEO_QUALIFICATION_ADD: "zonal.deo.qualification.add",
    DEO_SERVICE_ADD: "zonal.deo.service.add",
    DEO_WOP: "zonal.deo.w&op.edit",
    DEO_FAMILY: "zonal.deo.family.add",




  },

  PROVINCIAL: {
    PROVINCIAL_VIEW: "menu.provincial",
    ADMIN: "menu.provincial.admin",
    DEO: "menu.provincial.deo",
    ADMIN_CREATE: "provincial.admin.create",
    ADMIN_PROFILE_EDIT: "provincial.admin.profile.edit",
    DEO_PROFILE_EDIT: "provincial.deo.profile.edit",
    DEO_CREATE: "provincial.deo.create",
  },

  MOE: {
    MOE_VIEW: "menu.moe",
    ADMIN: "menu.moe.admin",
    ADMIN_CREATE: "moe.admin.create",
    ADMIN_BULK_UPLOAD: "moe.admin.bulk.upload",
    ADMIN_PROFILE_VIEW: "moe.admin.profile.view",
    ADMIN_DOCUMENTS: "moe.admin.profile.exportpdf",
    ADMIN_SERVICES: "moe.admin.service.add",
    ADMIN_QUALIFICATIONS: "moe.admin.qualification.add",
    ADMIN_WOP: "moe.admin.wop.edit",
    ADMIN_FAMILY: "moe.admin.family.add",
  },


  USER: {
    CREATE: "user.create",
    DELETE: "user.delete",
    EDIT: "user.edit",
    USER_VIEW: "menu.user",
    UPDATE: "user.update",
    USER_LIST: "user.list.view",
  },

  INBOX: {
    INBOX_VIEW: "menu.inbox",
  },

  // ADMIN: {
  //   ADMIN_VIEW: "menu.admin",
  // },

  TIMETABLE: {
    TIMETABLE_VIEW: "menu.timetable",
  },

  SETTINGS: {
    SETTINGS_VIEW: "menu.settings.system.settings",
    VERSION: "menu.settings.version",
    NOTIFICATIONS: "menu.settings.notifications",
    PRIVACY: "menu.settings.privacy",
    VERSION_ADD: "settings.version.add",
    VERSION_DELETE: "settings.version.delete",
    VERSION_EDIT: "settings.version.edit",
  },

};


