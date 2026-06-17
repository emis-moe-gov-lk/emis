# EMIS API Reference

**Base URL (UAT):** `https://services.app-uat.emis.moe.gov.lk/hrm/1.0.0`  
**Backend:** Laravel + FrankenPHP (routed through WSO2 API Manager)  
**Version:** 1.0

---

## Authentication

Endpoints marked **🔒 JWT** require a Bearer token issued by WSO2 Identity Server:

```
Authorization: Bearer <your-token>
```

Endpoints marked **🌐 Public** are accessible without a token.

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [Authentication](#2-authentication)
3. [Reference / Lookup Data](#3-reference--lookup-data)
4. [Offices](#4-offices)
5. [Institutions](#5-institutions)
6. [Teachers](#6-teachers)
7. [Principals](#7-principals)
8. [Alerts](#8-alerts)
9. [Employer Appointment Confirmation](#9-employer-appointment-confirmation)
10. [DOS Admins](#10-dos-admins)
11. [DEO Officers](#11-deo-officers)
12. [Profile & Identity](#12-profile--identity)
13. [User Management](#13-user-management)
14. [Roles & Permissions](#14-roles--permissions)
15. [Versions & Change Logs](#15-versions--change-logs)
16. [Timetable](#16-timetable)

---

## 1. Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/test` | 🌐 Public | Confirms the API is reachable. Returns a JSON status message. |

---

## 2. Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/login` | 🌐 Public | Authenticates a user and returns an access token. |

---

## 3. Reference / Lookup Data

Read endpoints are publicly accessible. Write endpoints update existing reference table entries.

### Appointed Subjects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/apointed-subjects` | 🌐 Public | Returns all appointed subjects. |
| `PATCH` | `/apointed-subjects/{id}` | 🌐 Public | Updates an appointed subject by ID. |

### Authorities

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/authorities` | 🌐 Public | Returns all authorities. |
| `PUT` | `/authorities/{id}` | 🌐 Public | Updates an authority by ID. |

### Blood Groups

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/blood-groups` | 🌐 Public | Returns all blood groups. |
| `PUT` | `/blood-groups/{id}` | 🌐 Public | Updates a blood group by ID. |

### Titles

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/titles` | 🌐 Public | Returns all honorific titles. |
| `PUT` | `/titles/{id}` | 🌐 Public | Updates a title by ID. |

### Teacher Types

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/teacher-types` | 🌐 Public | Returns all teacher types. |
| `PUT` | `/teacher-types/{id}` | 🌐 Public | Updates a teacher type by ID. |

### Teacher Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/teacher-categories` | 🌐 Public | Returns all teacher categories. |
| `GET` | `/teacher-categories/{id}` | 🌐 Public | Returns a single teacher category by ID. |
| `PUT` | `/teacher-categories/{id}` | 🌐 Public | Updates a teacher category by ID. |

### Services

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/services` | 🌐 Public | Returns all services. |
| `GET` | `/services/{id}` | 🌐 Public | Returns a single service by ID. |
| `PUT` | `/services/{id}` | 🌐 Public | Updates a service by ID. |

### Service Ranks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/service-ranks` | 🌐 Public | Returns all service ranks. |
| `GET` | `/service-ranks/{id}` | 🌐 Public | Returns a single service rank by ID. |
| `PUT` | `/service-ranks/{id}` | 🌐 Public | Updates a service rank by ID. |

### Subjects (HRM reference)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/subjects` | 🌐 Public | Returns all subjects in the HRM reference list. |
| `GET` | `/subjects/{id}` | 🌐 Public | Returns a single subject by ID. |
| `PUT` | `/subjects/{id}` | 🌐 Public | Updates a subject by ID. |

---

## 4. Offices

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/moe-list` | 🌐 Public | Returns all Ministry of Education offices. |
| `GET` | `/pmoe-list` | 🌐 Public | Returns all Provincial Ministry of Education offices. |
| `GET` | `/peo-list` | 🌐 Public | Returns all Provincial Education Office records. |
| `GET` | `/zeo-list` | 🔒 JWT | Returns all Zonal Education Office records. |
| `GET` | `/deo-list` | 🔒 JWT | Returns all Divisional Education Office records. |
| `GET` | `/office/{type}/{workplace_id}` | 🌐 Public | Returns a single office record. `type` is the office category; `workplace_id` is the office identifier. |

---

## 5. Institutions

All institution endpoints require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/institutions` | 🔒 JWT | Returns a paginated list of all institutions. |
| `GET` | `/institutions/filters` | 🔒 JWT | Returns available filter options (province, zone, division, type) for the institution list. |
| `GET` | `/institutions/{id}` | 🔒 JWT | Returns a single institution by ID. |
| `PUT` | `/institutions/{id}` | 🔒 JWT | Updates an institution record by ID. |

---

## 6. Teachers

All teacher endpoints require authentication.

### Listing & Search

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/teacher-settings` | 🔒 JWT | Returns teacher settings and configuration data. |
| `GET` | `/teachers-list` | 🔒 JWT | Returns a paginated list of all teachers. |
| `GET` | `/teacher/{people_id}` | 🔒 JWT | Returns the full profile of a single teacher. |
| `GET` | `/teachers/check-nic/{nic}` | 🔒 JWT | Checks whether a teacher with the given NIC already exists. |

### Form Data

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/teachers/personal-form-data` | 🔒 JWT | Returns dropdown data for the teacher personal information form. |
| `GET` | `/register/appointment-form-data` | 🔒 JWT | Returns dropdown data for the first appointment registration form. |
| `GET` | `/teachers/current-appointment-form-data` | 🔒 JWT | Returns dropdown data for the current appointment form, filtered by the caller's role. |
| `GET` | `/education-qualifications` | 🔒 JWT | Returns the list of education qualifications available for selection. |
| `GET` | `/education-qualification-grades` | 🔒 JWT | Returns the list of education qualification grades. |

### Create & Update

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/teacher-create` | 🔒 JWT | Creates a new teacher profile. |
| `PATCH` | `/teachers/{people_id}` | 🔒 JWT | Updates an existing teacher profile. |
| `POST` | `/teachers/check-contact` | 🔒 JWT | Checks whether the supplied email or phone number is already in use. |

### Sub-resources

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/teachers/{people_id}/education-qualifications` | 🔒 JWT | Saves education qualification records for a teacher. |
| `POST` | `/teachers/{people_id}/service-history` | 🔒 JWT | Adds a service history entry to a teacher record. |
| `POST` | `/teachers/{people_id}/past-services` | 🔒 JWT | Adds a past service block to a teacher record. |

---

## 7. Principals

All principal endpoints require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/principals-list` | 🔒 JWT | Returns a paginated list of all principals. |
| `POST` | `/principal-create` | 🔒 JWT | Creates a new principal profile. |
| `GET` | `/principal-recruitment-categories` | 🔒 JWT | Returns recruitment categories available for principals. |
| `GET` | `/principal/{people_id}` | 🔒 JWT | Returns the full profile of a single principal. |
| `POST` | `/principals/{people_id}/service-history` | 🔒 JWT | Adds a service history entry to a principal record. |
| `POST` | `/principals/{people_id}/past-services` | 🔒 JWT | Adds a past service block to a principal record. |

---

## 8. Alerts

All alert endpoints require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/alerts/counts` | 🔒 JWT | Returns counts for every alert category: pending verification, revised, pending confirmation, and rejected. |
| `GET` | `/alerts/pending-verification` | 🔒 JWT | Returns profiles that are pending verification. |
| `GET` | `/alerts/revised` | 🔒 JWT | Returns profiles that have been revised after a rejection. |
| `GET` | `/alerts/pending-confirmation` | 🔒 JWT | Returns profiles pending employer confirmation. |
| `GET` | `/alerts/rejected` | 🔒 JWT | Returns profiles that have been rejected. |

---

## 9. Employer Appointment Confirmation

Used by employers and HR officers to manage the teacher appointment workflow. All endpoints require authentication.

### Reject Comments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/employer-appointment-reject-comments` | 🔒 JWT | Returns all appointment rejection comments. |
| `GET` | `/employer-appointment-reject-comments/profile/{people_id}` | 🔒 JWT | Returns rejection comments for a specific profile. |
| `PATCH` | `/employer-appointment-reject-comments/{id}` | 🔒 JWT | Updates a rejection comment by ID. |

### Workflow Actions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `PATCH` | `/teachers/{people_id}/verify` | 🔒 JWT | Marks a teacher profile as verified. |
| `PATCH` | `/teachers/{people_id}/confirm` | 🔒 JWT | Confirms a teacher's appointment. |
| `PATCH` | `/principals/{people_id}/confirm` | 🔒 JWT | Confirms a principal's appointment. |
| `PATCH` | `/teachers/{people_id}/promote` | 🔒 JWT | Promotes a teacher. |
| `PATCH` | `/teachers/{people_id}/reject` | 🔒 JWT | Rejects a teacher's appointment. |
| `PATCH` | `/teachers/{people_id}/update` | 🔒 JWT | Updates a teacher record through the employer workflow. |
| `PATCH` | `/teachers/{people_id}/rejected-status` | 🔒 JWT | Updates the rejected status flag on a teacher record. |

---

## 10. DOS Admins

Base path: `/dos-admins`. All endpoints require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/dos-admins` | 🔒 JWT | Returns all Department of Schools administrator profiles. |
| `POST` | `/dos-admins` | 🔒 JWT | Registers a new education administrator. |
| `GET` | `/dos-admins/{id}` | 🔒 JWT | Returns a single DOS admin profile. |
| `POST` | `/dos-admins/{id}/service-history` | 🔒 JWT | Adds a service history entry for a DOS admin. |
| `POST` | `/dos-admins/{id}/past-services` | 🔒 JWT | Adds a past service block for a DOS admin. |

---

## 11. DEO Officers

Base path: `/deo-officers`. All endpoints require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/deo-officers` | 🔒 JWT | Returns all Divisional Education Office officers. |
| `GET` | `/deo-officers/form-data` | 🔒 JWT | Returns dropdown data for the DEO officer form. |
| `GET` | `/deo-officers/current-appointment-form-data` | 🔒 JWT | Returns dropdown data for the DEO current appointment form. |
| `POST` | `/deo-officers` | 🔒 JWT | Creates a new DEO officer record. |
| `GET` | `/deo-officers/{id}` | 🔒 JWT | Returns a single DEO officer profile. |
| `PATCH` | `/deo-officers/{id}` | 🔒 JWT | Updates a DEO officer record. |
| `DELETE` | `/deo-officers/{id}` | 🔒 JWT | Deactivates (soft-deletes) a DEO officer record. |

---

## 12. Profile & Identity

All endpoints require authentication.

### Identity

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/identity` | 🔒 JWT | Returns the identity details of the authenticated user. |
| `GET` | `/mobile/identity` | 🔒 JWT | Returns identity details for the mobile teacher profile view. |

### Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/profile` | 🔒 JWT | Returns the full profile of the authenticated user. |
| `GET` | `/user/{people_id}` | 🔒 JWT | Returns user account details for the given `people_id`. |
| `GET` | `/dashboard/{people_id}` | 🔒 JWT | Returns dashboard data for the given `people_id`. |
| `GET` | `/pdf/teacher/{people_id}` | 🔒 JWT | Generates and streams a PDF of the teacher's profile. |

### Avatar

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/profile/avatar` | 🔒 JWT | Returns the profile avatar of the authenticated user. |
| `POST` | `/profile/avatar` | 🔒 JWT | Uploads a new profile avatar image. |
| `PATCH` | `/profile/avatar` | 🔒 JWT | Updates avatar metadata (partial update). |
| `DELETE` | `/profile/avatar` | 🔒 JWT | Deletes the profile avatar. |

### Password

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `PATCH` | `/profile/password` | 🔒 JWT | Changes the password of the authenticated user. |
| `POST` | `/profile/password/complete-external` | 🔒 JWT | Completes an externally-initiated password change flow. |

---

## 13. User Management

All endpoints require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users` | 🔒 JWT | Returns a list of all system users. |
| `POST` | `/users` | 🔒 JWT | Creates a new system user. |
| `GET` | `/users/{id}` | 🔒 JWT | Returns a single user by ID. |
| `PATCH` | `/users/{id}` | 🔒 JWT | Updates a user record. |
| `DELETE` | `/users/{id}` | 🔒 JWT | Deletes a user. |
| `PATCH` | `/users/{id}/toggle-status` | 🔒 JWT | Toggles the active / inactive status of a user. |
| `POST` | `/users/{id}/reset-password` | 🔒 JWT | Resets the password for a user. |

---

## 14. Roles & Permissions

### Roles

Requires authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/roles` | 🔒 JWT | Returns all roles. |
| `POST` | `/roles` | 🔒 JWT | Creates a new role. |
| `PUT` | `/roles/{id}` | 🔒 JWT | Updates a role by ID. |

### Permissions

Publicly accessible.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/permissions` | 🌐 Public | Returns all available permissions. |
| `GET` | `/permissions/{roleid}` | 🌐 Public | Returns permissions assigned to a given role. |
| `DELETE` | `/permissions/{roleid}` | 🌐 Public | Removes permissions from a role. |

---

## 15. Versions & Change Logs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/versions` | 🌐 Public | Returns all application versions together with their change logs. |
| `POST` | `/versions` | 🌐 Public | Creates a new version entry. |
| `PUT` | `/versions/{id}` | 🌐 Public | Updates a version entry. |
| `DELETE` | `/versions/{id}` | 🌐 Public | Deletes a version entry. |

---

## 16. Timetable

All timetable endpoints use the prefix `/v1`. All `/v1/timetable` endpoints require authentication.

### Subjects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/subjects` | 🌐 Public | Returns the global subjects list used by the timetable module. |

### Core

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/init` | 🔒 JWT | Returns the full initialisation payload (setup, periods, intervals, slots, subject colours, holidays) in a single call — used to bootstrap the timetable UI. |
| `GET` | `/v1/timetable/week` | 🔒 JWT | Returns the full week timetable for the authenticated teacher. |
| `GET` | `/v1/timetable/current-class` | 🔒 JWT | Returns the currently active class (dashboard widget). |

### Setup

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/setup` | 🔒 JWT | Returns the timetable configuration for the authenticated teacher. |
| `POST` | `/v1/timetable/setup` | 🔒 JWT | Creates or replaces the timetable configuration. |

### Slots

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/slots` | 🔒 JWT | Returns all timetable slots. |
| `POST` | `/v1/timetable/slots` | 🔒 JWT | Creates a new timetable slot. |
| `PUT` | `/v1/timetable/slots/{slot}` | 🔒 JWT | Updates a timetable slot. |
| `DELETE` | `/v1/timetable/slots/{slot}` | 🔒 JWT | Deletes a timetable slot. |
| `GET` | `/v1/timetable/slots/{slot}/comments` | 🔒 JWT | Returns comments attached to a specific slot. |

### Periods

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/periods` | 🔒 JWT | Returns all periods in the authenticated teacher's timetable. |
| `PUT` | `/v1/timetable/periods/{period}` | 🔒 JWT | Updates a period. |

### Intervals

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/intervals` | 🔒 JWT | Returns all intervals (breaks) in the timetable. |
| `PUT` | `/v1/timetable/intervals/{interval}` | 🔒 JWT | Updates an interval. |

### Subject Colours

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/subject-colors` | 🔒 JWT | Returns all subject colour mappings. |
| `POST` | `/v1/timetable/subject-colors` | 🔒 JWT | Creates a new subject colour mapping. |
| `DELETE` | `/v1/timetable/subject-colors/{subjectColor}` | 🔒 JWT | Deletes a subject colour mapping. |

### Holidays

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/holidays` | 🔒 JWT | Returns all holidays configured in the timetable. |
| `POST` | `/v1/timetable/holidays` | 🔒 JWT | Creates a new holiday entry. |
| `DELETE` | `/v1/timetable/holidays/{holiday}` | 🔒 JWT | Deletes a holiday entry. |

### Lesson Records

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/lesson-records` | 🔒 JWT | Returns all lesson records for the authenticated teacher. |
| `GET` | `/v1/timetable/lesson-records/dates` | 🔒 JWT | Returns the dates on which lesson records exist. |
| `GET` | `/v1/timetable/lesson-records/by-slot/{slot}` | 🔒 JWT | Returns lesson records filtered to a specific slot. |
| `POST` | `/v1/timetable/lesson-records` | 🔒 JWT | Creates a new lesson record. |
| `PUT` | `/v1/timetable/lesson-records/{lessonRecord}` | 🔒 JWT | Updates a lesson record. |
| `DELETE` | `/v1/timetable/lesson-records/{lessonRecord}` | 🔒 JWT | Deletes a lesson record. |

### Report

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/timetable/report` | 🔒 JWT | Returns the timetable report for the authenticated teacher. |
