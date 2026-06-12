# EMIS Backend Architecture

> Audience: new developers joining the `backend/` (Laravel 12 + FrankenPHP) service.
> This is a **pure JSON API** consumed by the React frontend through the WSO2 APIM gateway. There is no
> server-rendered UI — `routes/web.php` contains only dead/commented-out Livewire code from an earlier
> iteration of the project and can be ignored.
>
> See also: [`docs/backend/RBAC_DOCUMENTATION.md`](RBAC_DOCUMENTATION.md) (written against the older
> Livewire app — permission *names* and the Spatie setup are still accurate, but the route-level
> enforcement it describes no longer applies to the API; see [Authorization](#5-authorization) below
> for how the API actually enforces access today). For registration data-flow details, see
> [`docs/registration-table-impact.md`](../registration-table-impact.md).

---

## 1. High-level picture

```
React frontend (Vite)
   │  axios calls VITE_API_BASE_URL
   ▼
Laravel backend (FrankenPHP)
   │  JwtGuard validates the JWT against WSO2 IS's JWKS
   │  resolves People -> User by people.uuid == JWT "sub"
   ▼
MySQL (people, users, employer_appointments, workplaces, ...)
```

> **APIM is not currently part of the live flow.** `docker-stack.yml` / `nginx-proxy` still provision a
> `wso2-apim` service and a `services.*` gateway host (`/hrm/1.0.0` → APIM → backend `/api/...`), and the
> `VITE_API_BASE_URL=.../hrm/1.0.0` convention reflects that *intended* target architecture — but APIM is
> not currently configured/active (see the "noapim build" infra work). Right now the frontend talks to
> the backend directly (e.g. via the `api-uat.emis.moe.gov.lk` host straight to the `backend` container),
> and JWTs come straight from WSO2 IS without passing through an APIM gateway. Don't assume an APIM hop
> exists when reasoning about request flow or debugging — treat the diagram above (frontend → backend
> directly) as current reality, and the APIM-gateway version as the not-yet-active target.

The backend itself never issues tokens for API consumers — **WSO2 Identity Server (IS) is the token
issuer**. The backend only:

1. Validates JWTs presented by API callers (`JwtGuard`).
2. Provisions/syncs user accounts *into* WSO2 IS via SCIM2 (`Wso2IsProvisioningService`,
   `AsgardeoIdentityProvisioningService`).
3. Stores the application's own copy of identity/profile data (`people`, `users` tables) for
   relational joins, RBAC (Spatie), and business logic.

---

## 2. Authentication

### 2.1 `JwtGuard` — how every authenticated request is resolved

File: `app/Auth/JwtGuard.php`, registered as the `jwt` driver in `app/Providers/AppServiceProvider.php`
and used as the default guard (`config/auth.php`: `AUTH_GUARD=jwt`). Routes opt in via
`->middleware('auth:jwt')`.

On each request:

1. Reads the `Authorization: Bearer <token>` header. No header → unauthenticated (`null` user).
2. Fetches WSO2 IS's JWKS from `config('auth.jwks_uri')` (`{WSO2_BASE_URL}/oauth2/jwks`), **cached for
   1 hour** (`Cache::remember('jwks_keyset', 3600, ...)`).
3. Verifies the JWT signature/expiry with `firebase/php-jwt` (`JWT::$leeway = 60` seconds).
4. Reads the `roles` claim into `$request->attributes->set('jwt_roles', ...)` — many controllers read
   this directly (combined with DB roles via `ResolvesZonalScope::resolvedRoles()`).
5. Reads the `sub` claim as a **UUID** and looks up `People::where('uuid', $uuid)`.
6. Looks up `User::where('people_id', $person->people_id)`.
7. Sets `jwt_uuid` / `jwt_people_id` request attributes and returns the local `User` model.

If any step fails (no token, bad signature, no matching `People.uuid`, no linked `User`), the guard
returns `null` and Laravel responds `401 {"message":"Unauthenticated."}` for `/api/*` routes (configured
in `bootstrap/app.php`'s exception renderer).

> **Why `people.uuid`, not email?** Older code resolved users by email (still present, commented out, in
> `JwtGuard` as an "emergency fallback" — see the comment block in the source). The current approach
> (commit "Resolve JWT users by UUID (people.uuid)") avoids ambiguity/case issues with email matching.
> `people.uuid` is populated when the account is provisioned into WSO2 IS — it **is** the WSO2 IS user ID
> (see [3.1](#31-wso2-is-provisioning-wso2isprovisioningservice)).

### 2.2 Login

`POST /login` (`AuthenticationController@login`) — checks `users.email` + password via
`Auth::attempt()`, returns `must_change_password` / `password_change_required_reason` flags. **It does
not issue a JWT** — token issuance is entirely WSO2 IS's job (the frontend talks to IS's `/oauth2/token`
endpoint directly/through APIM for the actual login token; this Laravel endpoint appears to be a
secondary/legacy local-credentials check). `register`, `logOut`, `userInfo` on the same controller exist
but are **not routed** — dead code.

### 2.3 Legacy OIDC web login (dead code)

`app/Http/Controllers/Auth/OIDCLoginController.php` + `app/Services/OIDCProvider.php` implement a full
browser-redirect OIDC flow (Socialite) against WSO2 IS, including RP-initiated logout. **All routes for
this are commented out in `routes/web.php`.** Safe to ignore unless reviving server-side session login.

### 2.4 Middleware, CORS & error responses

`bootstrap/app.php` is the single source of truth for HTTP-layer wiring (Laravel 12 has no `Kernel.php`):

- **Routing**: `routes/web.php` (dead, see above), `routes/api.php`, `routes/console.php`, plus the
  default `/up` health check.
- **Guest redirect**: `redirectGuestsTo` returns `null` (→ `401` JSON) for any `api/*` or
  `Accept: application/json` request instead of redirecting to a login page — there's no web login UI to
  redirect to.
- **Middleware aliases**: `role`, `permission`, `role_or_permission` (Spatie) are registered but **not
  referenced by any API route** — see [§5](#5-authorization) for how authorization actually happens.
- **Exception rendering**: only `AuthenticationException` has a custom renderer (→ `401
  {"message":"Unauthenticated."}` for `api/*`/JSON requests, per §2.1). Everything else — `403`
  (`AuthorizationException`), `404` (`ModelNotFoundException`/route-not-found), `422`
  (`ValidationException`), `500`s — falls through to **Laravel's default JSON exception renderer**
  (triggered automatically for `api/*`/JSON requests), which includes `exception`/`file`/`line`/`trace`
  **when `APP_DEBUG=true`**. Make sure `APP_DEBUG=false` in any environment real users can reach.
- **CORS** (`config/cors.php`): wide open — `allowed_origins: ['*']`, `allowed_methods: ['*']`,
  `allowed_headers: ['*']` for `api/*` and `sanctum/csrf-cookie`. No origin allowlist to maintain when a
  new frontend host is added.

---

## 3. Identity provisioning (creating/syncing accounts in WSO2 IS)

Two parallel provisioning services exist — **know which one is actually wired up**:

| Service | Implements `IdentityProvisioningServiceInterface`? | Bound in `AppServiceProvider`? | Used by |
|---|---|---|---|
| `Wso2IsProvisioningService` | No (concrete class only) | No | `TeacherAccountProvisioningService`, `TeacherToPrincipalPromotionService`, `UserManagementController` — i.e. **everything that actually runs today** |
| `AsgardeoIdentityProvisioningService` | Yes | **Yes** — `IdentityProvisioningServiceInterface` is bound to this class | Nothing currently calls the interface, so this binding is currently inert |

This looks like a half-finished migration toward an Asgardeo-based abstraction. **For now, treat
`Wso2IsProvisioningService` as the live integration.**

### 3.1 WSO2 IS provisioning (`Wso2IsProvisioningService`)

File: `app/Services/Wso2IsProvisioningService.php`. Talks to WSO2 IS's **SCIM2** API using a
machine-to-machine (M2M) OAuth2 client-credentials token (`config('services.wso2_is.*')`,
env: `WSO2_ENABLED`, `WSO2_BASE_URL`, `WSO2_VERIFY_SSL`, `WSO2_M2M_CLIENT_ID`, `WSO2_M2M_CLIENT_SECRET`).
All methods are no-ops (`{enabled: false, skipped: true}`) if `WSO2_ENABLED` is falsy.

Key operations:

- **`provisionUser(User $user, string $plainPassword, string $role)`**
  - Looks up an existing IS user by `userName eq "PRIMARY/{email}"`; creates one via
    `POST /scim2/Users` if not found (username = `PRIMARY/{email}`, name split heuristically into
    given/family from `people.full_name`).
  - Resolves the Spatie role name to a WSO2 IS role UUID via a **static config map**
    (`config('services.wso2_is.role_ids')`, keyed by lowercased role name) and assigns the user to that
    role (`PATCH /scim2/v2/Roles/{roleId}`). If a role isn't present in the map, role assignment is
    skipped with a warning log — the role IDs must be kept in sync manually with whatever role UUIDs
    exist in the target WSO2 IS tenant (env-driven, so they differ between local/UAT/prod).
  - **Persists back to the local DB**: `users.identity_provider = 'wso2_is'`,
    `users.identity_provider_user_id = <IS user id>`, `users.account_provisioned_at = now()`, and —
    importantly — **`people.uuid = <IS user id>`** (this is the value `JwtGuard` later matches against
    the JWT `sub` claim).
- **`syncUserProfile(User $user)`** — pushes name/phone/active-status changes to the existing IS user.
- **`updateUserRole(User $user, $fromRole, $toRole)`** — removes the old role, assigns the new one (used
  by the teacher→principal promotion flow).
- **`updatePassword(User $user, $newPlainPassword)`** — pushes a password change to IS; lets HTTP errors
  (e.g. password-policy violations) bubble up so the controller can surface them.

### 3.2 Local provisioning orchestration (`TeacherAccountProvisioningService`)

File: `app/Services/TeacherAccountProvisioningService.php`. This is the glue between a `People` record
and a `User` (login) account, called from the **confirmation** step of registration (see
[4.4](#44-verification--confirmation--promotion-workflow)).

- **`provisionFromPerson(People $person, bool $resetDefaultPassword, string $role = 'teacher')`**
  - Default password = `'Pw' . NicHelper::normalize($nic)`.
  - `User::firstOrNew(['people_id' => $person->people_id])` — creates the user row if it doesn't exist.
  - For new users (or when `$resetDefaultPassword`), sets the default password, `must_change_password =
    true`, bumps `default_password_version`.
  - Sets `identity_provider = 'local'`, copies `name`/`email`/`contact`/`nic(_hash)` from `People`.
  - If promoting to `principal`, removes the `teacher` Spatie role first; ensures the target role is
    assigned.
  - Calls `Wso2IsProvisioningService::provisionUser(...)` to create/sync the WSO2 IS account and stamp
    `people.uuid`.
- **`syncProfile(People $person)`** — keeps an existing `User`'s name/email/contact/nic in sync with
  `People` after profile edits, then calls `Wso2IsProvisioningService::syncUserProfile`.
- **`completePasswordChange(User $user)`** — clears `must_change_password`, stamps
  `password_changed_at`.

### 3.3 Password change flow

`PATCH /profile/password` (`ProfileController::changePassword`) — validates the current password, then
calls `Wso2IsProvisioningService::updatePassword` **first**; if WSO2 IS rejects it (e.g. password policy),
the request fails with that detail and the **local password is not changed**. Only on IS success does it
update the local `users.password` and call `TeacherAccountProvisioningService::completePasswordChange`.

---

## 4. Domain model

### 4.1 Core identity entities

```
People  (table: people)
  PK: id            internal numeric PK
  people_id         business key, e.g. PE2500000123 (auto-generated)
  uuid              WSO2 IS user id — JWT "sub" claim resolves here  (added 2026-06-10)
  nic (encrypted) / nic_hash (sha256 of normalized NIC, indexed/unique)
  title_id, gender_id, religion_id, ethnicity_id, civil_status_id, blood_group_id  -> lookup tables
  district_id, gn_division_id, ds_office_id -> geography
  ─── hasOne ───────────────────────────────► User (people_id = people_id)
  ─── hasMany ──────────────────────────────► EmployerAppointment        (every role ever granted)
  ─── hasOne  ──────────────────────────────► EmployerCurrentAppointment (the ONE active role)
  ─── hasMany ──────────────────────────────► EmployerAppointmentHistory (closed-out roles)
  ─── hasOne  ──────────────────────────────► EmployerAttachmentAppointment (secondment)
  ─── hasOne  ──────────────────────────────► Teacher / Principal / EducationAdministratorService / EmployerCadreSubject
  ─── hasMany ──────────────────────────────► PeopleEducationQualification, Family

User  (table: users)
  people_id (unique FK -> people.people_id)
  nic / nic_hash, name, email, contact   -- bidirectionally synced with People on save
  must_change_password, password_initialized_at, password_changed_at
  identity_provider (default 'asgardeo'), identity_provider_user_id, account_provisioned_at
  default_password_version
  Spatie HasRoles (roles, permissions)
```

`People::saved()` and `User::saved()` push shared fields (`nic`, `nic_hash`, `name`, `email`,
`phone`/`contact`) to each other via `saveQuietly()` to avoid recursive save loops — **the two tables are
kept in sync bidirectionally**, so updating either one updates the other.

### 4.2 Appointments & role-detail tables

| Model | Table | Purpose |
|---|---|---|
| `EmployerAppointment` | `employer_appointments` | Master record of a granted appointment (`appointment_id`, `service_id`, `rank_id`, `position_id`, `office_level_id`, `workplace_id`, `is_verified`, `is_confirmed`). |
| `EmployerCurrentAppointment` | `employer_current_appointments` | The person's **single active role** — `employee_id` and `appointment_id` are unique (1:1 with People). |
| `EmployerAppointmentHistory` | `employer_appointment_histories` | Append-only archive of past appointments (`end_date`, `updated_type`, `remarks`). |
| `EmployerAttachmentAppointment` | `employer_attachment_appointments` | Temporary secondment, separate from the substantive appointment. |
| `EmployerCadreSubject` | `employer_cadre_subjects` | Subject/medium a person is cadred against — used for cadre-vs-employer reconciliation (`CadreDMSApproved`). |
| `Teacher` | `teachers` | Role-detail for a teaching appointment (`teacher_category`, `teacher_type`, subjects). hasOne `TeacherTimetableConfig`. |
| `Principal` | `principals` | Role-detail for a principal appointment (`recruitment_category`). |
| `EducationAdministratorService` | `education_administrator_services` | Role-detail for SLEAS/admin-service officers (DOS/DEO/etc.). |
| `EmployeeAdministration` | `employee_administrations` | Generic admin recruitment info per appointment. |
| `TeacherRoleTransition` | `teacher_role_transitions` | Audit trail of role changes (`from_role`, `to_role`, `changed_by`, `metadata` JSON). |

All role-detail models follow the same pattern: `appointment()`, `currentAppointment()`,
`appointmentHistory()`, `attachmentAppointment()`, `employee()` (→ `People`), keyed on `appointment_id` /
`employee_id`.

### 4.3 Office / institution hierarchy (`workplaces`)

`Workplaces` (`app/Models/Workplaces.php`) is the central hub. Every appointment/institution references
a `workplace_id`. `office_level_id` says which detail table to join:

| `office_level_id` | Model | Table | Parent link |
|---|---|---|---|
| `OLID001` | `MinistryOfEducationOffice` | `ministry_of_education_offices` | top of tree |
| `OLID002` | `ProvincialMinistryOfEducationOffice` | `provincial_ministry_of_education_offices` | `moe_wp_id` |
| `OLID003` | `ProvincialEducationOffice` | `provincial_education_offices` | `pmoe_wp_id` |
| `OLID004` | `ZonalEducationOffice` | `zonal_education_offices` | `peo_wp_id` |
| `OLID005` | `DivisionalEducationOffice` | `divisional_education_offices` | `zeo_wp_id` |
| `OLID006` | `Institution` | `institutions` | `zeo_wp_id` **and** `deo_wp_id` (denormalized direct links) |

So the chain is **MOE → PMOE → PEO → ZEO → DEO → Institution**. `Workplaces::office()` resolves to the
matching model. `workplaces.parent_workplace_id` (string code, no FK constraint) builds the actual tree;
`Workplaces::getAllChildWorkplaces()` does a BFS down the tree (used everywhere "give me everyone under
this office" is needed), `getAllParentWorkplaces()` walks up.

`Institution.zeo_wp_id`/`deo_wp_id` are denormalized shortcuts (not purely derived from
`parent_workplace_id`) — a 2026-04-20 migration backfilled `office_level_id` on appointment tables from
`workplaces.office_level_id` to fix drift between the two representations.

`DivisionalSecretariatOffice` (referenced by `people.ds_office_id`) is a **separate** civil-administration
hierarchy (DS divisions/GN divisions, used for a person's home address) — don't confuse it with the MOE
office hierarchy above.

#### Zonal scoping — `ResolvesZonalScope` trait

`app/Traits/ResolvesZonalScope.php`, mixed into zone-aware controllers:

- `resolvedRoles($request)` — merges JWT `roles` claim + DB Spatie roles (normalized, deduped).
- `isSuperAdmin($roles)` — checks for `'super admin'`.
- `resolveUserZonalWorkplaceId($request)` — finds the caller's owning **Zonal Education Office**:
  if their workplace *is* a ZEO, use it; if it's a DEO, use its `zeo_wp_id`; otherwise (an institution)
  use its `zeo_wp_id`.
- `applyTeacherZonalScope($query, $zonalWorkplaceId)` — constrains a People/Teacher query to
  `currentAppointment.workplace.institution.zeo_wp_id == $zonalWorkplaceId`.

This is **the** mechanism for "Zonal Director only sees their zone's teachers" type restrictions.

### 4.4 Reference / lookup tables

Mostly seed-managed (no create/delete endpoints, only `index`/`show`/`update`):

`Title`, `GenderList`, `Religion`, `Ethnicity`, `CivilStatus`, `BloodGroup`, `Service`/`ServiceRank`,
`Position`/`PositionsRank`, `EducationQualification`/`EducationalQualificationGrade`, `TeacherType`,
`TeacherCategory`, `RecruitmentCategory`/`PrincipalRecruitmentCategory`, `GradeSpan`, `CadreCirculars`,
`CadreDMSApproved`, `EducationAdministratorServiceCategory`/`...Subject`, `SubjectList` (master subject
catalog — `type` 1=Subject/2=Designation/3=Other, plus per-grade bitmasks), `ApointedSubject`,
`MediumOfInstruction`, geography (`DistrictsList`, `GnDivision`, `DivisionalSecretariatOffice`,
`ProvincesList`, `PoliceStation`, `MohArea`, `Citylists`), and institution sub-lookups
(`InstitutionCategory`, `InstitutionAuthority`, `InstitutionType`, `InstitutionLanguages`,
`InstitutionGender`, `InstitutionalFacility`, `InstitutionEthnisity`).

### 4.5 Timetable subsystem (per-teacher)

Self-contained; everything hangs off `Teacher` → `TeacherTimetableConfig` (1:1, holds `day_start_time`,
`day_end_time`, `num_periods`, `off_days`):

- `Period` (`periods`) — `start_time`/`end_time`; hasMany `Slot`.
- `Interval` (`intervals`) — breaks between periods.
- `Slot` (`slots`) — `day`, `period_id`, `subject_id` (→ `SubjectList`, the only global reference),
  `class_name`, `students`, `purpose`, `date` (`null` = recurring weekly slot, set = one-off "special"
  slot). hasMany `Comment`, hasMany `LessonRecord`.
- `SubjectColor` (`subject_colors`) — per-teacher color coding, `(teacher_id, subject_id)`.
- `TeacherHoliday` (`teacher_holidays`) — `date`, `reason`.
- `LessonRecord` (`lesson_records`) / `LessonRecordOutcome` (`lesson_record_outcomes`, ordered by
  `sort_order`) — what was actually taught.

### 4.6 Spatie roles & permissions

Standard `spatie/laravel-permission` tables (`roles`, `permissions`, `model_has_roles`,
`role_has_permissions`, `model_has_permissions`); `User` uses `HasRoles`. Permission *names* and module
breakdown are documented in [`RBAC_DOCUMENTATION.md`](RBAC_DOCUMENTATION.md) — still accurate for
*naming*, but most of that doc's "route middleware" enforcement layer described there belongs to the old
Livewire app and is **not** how the current API enforces access (see §5).

`roles.level` (added 2026-04-27, `RolePermissionSeeder`) — a tinyint hierarchy rank used by
`UserApiController` to decide whether one user may view another's profile (`tokenUserRole->level <
targetRole->level`, lower = more senior):

| Level | Role(s) |
|---|---|
| 1 | Super Admin |
| 2 | SSA, MOE Administrator |
| 3 | Zonal Director |
| 4 | Zonal Deputy Director |
| 5 | Zonal Subject Head |
| 6 | Zonal DEO HEAD |
| 7 | Zonal DEO, Teacher |
| 8 | Principal |

---

## 5. Authorization

The API does **not** use Spatie's `permission:`/`role:` route middleware (those are wired up in
`bootstrap/app.php` as aliases but the API routes don't reference them). Instead, authorization is mostly
**in-controller**:

1. **`auth:jwt`** — every protected route requires a valid JWT (see §2.1). Public routes (`/test`,
   `/v1/subjects`, `/moe-list`, `/pmoe-list`, `/peo-list`, lookup-table `index`s, `/login`) skip this.
2. **Role checks inside controllers** — typically `ResolvesZonalScope::resolvedRoles($request)` +
   `hasAnyRole([...])`, e.g. registration/verification endpoints restrict to combinations of
   `super admin`, `zonal deo`, `zonal deo head`, `zonal director`, `development officer`.
3. **Zonal scoping** — `resolveUserZonalWorkplaceId()` + `applyTeacherZonalScope()` /
   `teacherBelongsToUserZonalArea()` restrict non-super-admin users to their own zone's data.
4. **`ViewRestrictPolicy`** (`app/Policies/ViewRestrictPolicy.php`, registered in
   `AuthServiceProvider`) — `viewRestrict(User, People)` checks
   `$people->currentAppointment->workplace_id` is within `$user->workplace->getAllChildWorkplaces()`.
   This is the generalized hierarchical-visibility check (mirrors the zonal trait but for any workplace
   level, not just zones).
5. **`UserApiController`** — viewing another person's profile additionally requires
   `tokenUserRole->level < targetRole->level` (see §4.6).

---

## 6. API surface by domain

All routes are prefixed `/api` (Laravel default) and then routed through APIM as `/hrm/1.0.0/...`. Source:
`routes/api.php` (general) + `routes/timetable.php` (`required` from `api.php`, prefix `v1`).

### 6.1 Auth & profile

| Method | Route | Controller |
|---|---|---|
| POST | `/login` | `AuthenticationController@login` |
| GET | `/identity` | `AuthIdentityController` — full identity bundle: roles, permissions, primary role, office level, workplace + zonal chain |
| GET | `/mobile/identity` | `MobileTeacherProfileController` — teacher-only profile bundle for the mobile app |
| GET/PATCH/POST/DELETE | `/profile`, `/profile/avatar` | `ProfileController` — self profile + avatar |
| PATCH | `/profile/password` | `ProfileController@changePassword` (see §3.3) |
| POST | `/profile/password/complete-external` | `ProfileController@completeExternalPasswordChange` |

### 6.2 User & role management (`auth:jwt`, mostly super-admin)

| Method | Route | Controller |
|---|---|---|
| GET/POST/PATCH/DELETE | `/users`, `/users/{id}` | `UserManagementController` |
| PATCH | `/users/{id}/toggle-status` | `UserManagementController@toggleStatus` |
| POST | `/users/{id}/reset-password` | `UserManagementController@resetPassword` (random password, emailed via `ResetPasswordMail`) |
| GET/POST/PUT | `/roles`, `/roles/{id}` | `RoleController` |
| GET | `/permissions`, `/permissions/{roleid}` | `RoleController@getpermissions`/`getuserpermissions` |
| GET | `/user/{people_id}` | `UserApiController` — see §4.6 hierarchy check |

`UserManagementController::update` detects a teacher→principal role change
(`TeacherToPrincipalPromotionService::isTeacherToPrincipalTransition`) and delegates to
`promote()` (§6.4) instead of a plain role sync.

### 6.3 Staff registration & profiles

Four parallel "staff type" flows, all `auth:jwt`:

- **Teacher** (`TeacherApiController`, the largest controller) — `/teacher-create`,
  `/teachers-list`, `/teacher/{people_id}`, `/teachers/{people_id}` (`updateProfile`, section-based:
  `personal`/`health`/`contact`/`temporary`/`current_appointment`/`my_appointment`/`teaching_info`/`wop`),
  plus NIC lookup, form-data lookups, education qualifications, service history.
- **Principal** (`PrincipalApiController`) — mirrors Teacher: `/principal-create`,
  `/principals-list`, `/principal/{people_id}`, recruitment categories.
- **DOS Admin** (`DosAdminController`, prefix `dos-admins`) — Zonal Director / Deputy Director
  registration. **Creates the `User` account immediately** (default password `Password@123`), unlike
  Teacher/Principal where account creation is deferred to confirmation.
- **DEO Officer** (`DeoOfficerController`, prefix `deo-officers`) — Development Officer / Zonal DEO
  registration, also creates the `User` account immediately. Has `update`/`destroy`
  (deactivate via `users.active_status = false`).

**Registration pattern for Teacher/Principal**: `People::updateOrCreate` (keyed on `nic_hash`) → guard
against an existing active `EmployerCurrentAppointment` → create `EmployerAppointment`
(`is_verified=0`, `is_confirmed=0`) → create `Teacher`/`Principal` row → create
`EmployerCurrentAppointment`. **No `User` row yet** — response says
`login_account_status: 'pending_confirmation'`. The login account is created later, at confirmation time
(§6.4).

### 6.4 Verification / confirmation / promotion workflow

`EmployerAppointmentConfirmationController` + `AlertController`. Status fields on
`EmployerAppointment`:

- `is_verified`: `0` pending → `1` verified, `2` rejected, `3` revised (re-submitted after rejection)
- `is_confirmed`: `0`/`1` (only meaningful once `is_verified === 1`)

| Step | Endpoint | Effect |
|---|---|---|
| Verify | `PATCH /teachers/{people_id}/verify` | `is_verified=1, is_confirmed=0`. Roles: development officer(+head), zonal deo(+head), super admin; zone-checked. |
| Confirm | `PATCH /teachers/{people_id}/confirm` (alias `/principals/{people_id}/confirm`) | `is_confirmed=1`, then **`TeacherAccountProvisioningService::provisionFromPerson()` creates the `User` account** (this is where login credentials first exist). |
| Reject | `PATCH /teachers/{people_id}/reject` | `is_verified=2, is_confirmed=0` + creates `EmployerAppointmentRejectComment` (reason required). |
| Revise/resubmit | `PATCH /teachers/{people_id}/rejected-status` (alias `update`) | only if currently rejected (`is_verified===2`) → `is_verified=3` (revised), re-queues for verification. |
| Edit reject comment | `PATCH /employer-appointment-reject-comments/{id}` | can append text; if `status=pending` and currently rejected, resets to `is_verified=0, is_confirmed=0`. |
| **Promote** | `PATCH /teachers/{people_id}/promote` | super admin / zonal director only; requires `is_verified===1 AND is_confirmed===1`; delegates to `TeacherToPrincipalPromotionService::promoteWithAppointmentTransition()`. |

`AlertController` (`/alerts/counts`, `/alerts/pending-verification`, `/alerts/revised`,
`/alerts/pending-confirmation`, `/alerts/rejected`) surfaces these queues, zone-scoped via
`ResolvesZonalScope`.

#### Teacher → Principal promotion (`TeacherToPrincipalPromotionService`)

Constants: principal service = `SLPS`/`SER004`, position `POS006`, rank `RANK010`.

- **`promoteWithAppointmentTransition()`** (used by the `/promote` endpoint, the "real" flow):
  1. Guards: must be a teacher→principal transition; active appointment must exist and be active; not
     already a principal-service appointment.
  2. In a transaction: archive the current appointment to `EmployerAppointmentHistory`
     (`end_date=now()`), deactivate it (`active_status=0`), create a **new** `EmployerAppointment` with
     `service_id=SER004`/`rank_id=RANK010`/`position_id=POS006` (carrying over workplace/office level),
     repoint `EmployerCurrentAppointment` at the new appointment, `syncRoles(['principal', ...])`,
     `Principal::updateOrCreate`, write a `TeacherRoleTransition` audit row.
  3. After commit: `Wso2IsProvisioningService::updateUserRole($user, 'teacher', 'principal')`.
- **`promote()`** (used by `UserManagementController::update` for a direct admin role edit) — a lighter
  "in-place" variant: flips `service_id` to SLPS on the *existing* appointment rather than creating a new
  one, otherwise same role-sync/`Principal::updateOrCreate`/audit/WSO2 steps.

### 6.5 Institutions & office hierarchy

- `InstitutionController` — `/institutions` (role-scoped: Zonal DEO sees own zone, DEO sees own
  division, others see only their own institution; admins get full filterable/paginated list),
  `/institutions/filters` (role-scoped dropdown data), `/institutions/{id}` show/update.
- `OfficesController` — `/moe-list`, `/pmoe-list`, `/peo-list` (public), `/zeo-list`, `/deo-list`
  (`auth:jwt`, zone-scoped for DEO/Zonal DEO roles), `/office/{type}/{workplace_id}` generic lookup.

### 6.6 Reference/lookup data

Thin `index`/`show`/`update` controllers (no create/delete — seed-managed):
`AuthorityController`, `BloodGroupController`, `TitleController`, `TeacherTypeController`,
`TeacherCategoryController`, `ServiceController`, `ServiceRankController`, `SubjectListController`
(supports `?lang=en/si/ta`), `ApointedSubjectController`, `VersionController` (app version/changelog —
`index` quirkily returns HTTP 201).

### 6.7 Timetable subsystem (`/v1/...`, `routes/timetable.php`)

Per-authenticated-teacher resources (`Auth::user()->teacher->timetableConfig`):

| Route | Controller | Notes |
|---|---|---|
| `GET /v1/subjects` | `SubjectController` | Public, global subject catalog. |
| `GET /v1/timetable/init` | `TimetableInitController` | Bootstrap payload: config, periods, intervals, subject colors, global subjects. |
| `GET /v1/timetable/week` | `TimetableWeekController` | Slots (regular + special) for a given `week_start`, with comments/holidays/recorded dates. |
| `GET/POST /v1/timetable/setup` | `TimetableSetupController` | Create/update day bounds & period count; recalculates periods via `PeriodCalculationService`, updating existing rows **in place** to preserve IDs/FKs. |
| `GET /v1/timetable/current-class` | `CurrentClassController` | "What's happening now/next" dashboard widget. |
| `/v1/timetable/slots` (CRUD) + `/slots/{slot}/comments` | `SlotController` | Owned by `teacher_id`; comments. |
| `/v1/timetable/periods` (index/update) | `PeriodController` | Editing one period shifts all later periods by the same delta. |
| `/v1/timetable/intervals` (index/update) | `IntervalController` | Recalculates **all** periods via `PeriodCalculationService` on change. |
| `/v1/timetable/subject-colors` | `SubjectColorController` | Per-teacher subject color coding. |
| `/v1/timetable/holidays` | `HolidayController` | Reports conflicting slots on the same weekday. |
| `/v1/timetable/lesson-records` (CRUD) + `/dates`, `/by-slot/{slot}` | `LessonRecordController` | Records of what was actually taught, with `LessonRecordOutcome`s. |
| `GET /v1/timetable/report` | `ReportController` → `ReportService` | Activity report for a date range. |

`PeriodCalculationService::calculate(dayStart, dayEnd, numPeriods, intervals)` is pure logic: splits the
day into `numPeriods` even chunks (remainder distributed to the first periods), then carves out
`intervals` at their clock positions, splitting/truncating periods that overlap an interval.

### 6.8 Dashboard & reports/PDF

- `DashboardController` (`GET /dashboard/{people_id}` — note: the path param is **overwritten** by the
  caller's own `jwt_people_id`) — branches on role: teacher/principal get `institutionData()` (their own
  institution + child-office breakdown), other roles get `adminData()` (counts across all child
  workplaces + office breakdown).
- `ReportController` (`/v1/timetable/report`) → `ReportService::generate()`.
- `TeacherPdf::generateSimplePdf` (`GET /pdf/teacher/{people_id}`) — the only **routed** PDF endpoint;
  generates a teacher profile PDF with a QR code of `people_id`. Other PDF controllers
  (`EmployeeController`, `InstitutionsReportController`, `ZeoPeportController`, `DeoReportController`,
  `TeacherId`) are **not routed** — dead/prototype code (`TeacherId` even uses hardcoded fake data).

---

## 7. Cross-cutting conventions

### 7.1 `Blameable` trait (`app/Traits/Blameable.php`)

Auto-fills `created_by`/`updated_by` with `Auth::user()->people_id` (not `user_id`) on
create/update — applied to most domain models.

### 7.2 Activity logging

`spatie/laravel-activitylog`. `app/Observers/ActivityObserver.php` (registered in
`AppServiceProvider::boot()`) stamps every `Activity` row with `causer_id = Auth::id()` and
`ip_address = request()->ip()`. Config: `config/activitylog.php` (365-day retention,
`ACTIVITY_LOGGER_*` env vars).

### 7.3 NIC handling (`app/Helpers/NicHelper.php`)

Sri Lankan NICs come in two formats (old 9-digit+V/X, new 12-digit). `NicHelper`:
- `normalize()` — cleans input to a canonical uppercase string.
- `toNewFormat()` — converts old→new format (`19YY` + day-of-year + serial) so old/new NICs for the same
  person hash identically.
- `hash()` — `sha256(toNewFormat($nic))`, stored as `nic_hash` and used for all duplicate-detection
  (`UniqueHashedNic`, `UniqueHashedNicUser` rules) and lookups.
- `extractDetails()` — derives birthday/gender from the NIC's day-of-year encoding.

### 7.4 Cross-table uniqueness rules (`app/Rules/`)

`UniqueEmailAcrossTables`, `UniquePhoneAcrossTables`, `UniqueHashedNic`, `UniqueHashedNicUser` — enforce
that email/phone/NIC are unique across **both** `people` and `users` tables (registration writes to
both — see [`docs/registration-table-impact.md`](../registration-table-impact.md)).

### 7.5 `RouteHelper` (`app/Helpers/RouteHelper.php`)

`enc()`/`dec()` — thin wrappers over `Crypt::encryptString`/`decryptString` for obfuscating route
parameters; `dec()` returns `null` instead of throwing on a tampered value.

### 7.6 Request validation: Form Requests vs inline

Two patterns coexist:

- **Form Request classes** (`app/Http/Requests/`) — used mainly by the timetable subsystem and a couple
  of teacher endpoints: `StoreTeacherRequest`, `StoreSlotRequest`, `UpdateSlotRequest`,
  `StoreTimetableSetupRequest`, `UpdatePeriodRequest`, `StoreHolidayRequest`, `StoreSubjectColorRequest`,
  `StoreLessonRecordRequest`, `UpdateLessonRecordRequest`, `TeacherReportRequest`. Each has its own
  `authorize()`/`rules()`.
- **Inline `$request->validate([...])`** — the majority of controllers (registration, user management,
  lookups) validate inline inside the action method, typically inside a `try/catch (\Throwable)` that maps
  `ValidationException` to a `422 {status: 'validation_error', errors: ...}` response (e.g.
  `UserManagementController::store`).

Either way, for email/phone/NIC the cross-table uniqueness rules in `app/Rules/` (§7.4) are the ones that
matter — column-level `unique:` rules alone aren't sufficient since both `people` and `users` store these
fields.

### 7.7 File storage (avatars)

Profile avatars (`POST/PATCH/DELETE /profile/avatar`, `ProfileController`) are the only user-uploaded
files in the system:

- Stored on `config('filesystems.profile_photo_disk', 'public')` — **`profile_photo_disk` is not actually
  defined in `config/filesystems.php`**, so this always resolves to the default `public` disk
  (`storage/app/public`, served at `APP_URL/storage` via the `storage:link` symlink) **regardless of
  `FILESYSTEM_DISK`**.
- Path convention: `profile-photos/{filename}`; the filename is stored on `users.profile_picture` (and
  mirrored onto `people` via the bidirectional sync in §4.1). Default placeholder is `default.png`.
- Replacing/deleting an avatar deletes the old file from disk first.
- An `s3` disk is configured (`config/filesystems.php` + `AWS_*` env vars) but nothing points at it —
  moving avatars to S3 would need an explicit `'profile_photo_disk' => env('FILESYSTEM_DISK', 'public')`
  mapping added to `config/filesystems.php`, since the hardcoded fallback ignores `FILESYSTEM_DISK`.

---

## 8. Known gaps / tech debt (worth knowing before you touch nearby code)

- **`MobileTeacherProfileController`** references an undefined `$email` variable — `/mobile/identity`
  likely throws/warns on every call.
- **`DeoOfficerController::update`**'s validation-failure path logs `activity('deo_officer_update')` with
  an undefined `$id` (parameter is `$people_id`).
- **`IdentityProvisioningServiceInterface`** is bound to `AsgardeoIdentityProvisioningService`, but no
  code calls it through the interface — `Wso2IsProvisioningService` (concrete class) is what's actually
  used everywhere. Don't assume the interface binding reflects the live integration.
- **`MobitelSmsService`** has no corresponding `config/services.php` entry — `config('services.mobitel.*')`
  resolves to `null` everywhere; the service is non-functional until that config block + env vars are
  added. `SMSController`/`SoapController` (a separate SOAP-based SMS path) are unrouted/dead.
- **`asgardeo.enabled`** and **`wso2_is.enabled`** both read `WSO2_ENABLED` but with different defaults
  (`true` vs `false`) — check both if toggling.
- Several PDF controllers and `app/Http/Controllers/API/TeacherController.php` (old timetable model) and
  `MasterController` (empty stub) are dead code, not routed.
- `routes/web.php` is entirely commented-out legacy Livewire code (RBAC doc references it) —
  the live RBAC enforcement for the API is described in §5, not in `RBAC_DOCUMENTATION.md`'s route
  middleware section.
- **`TeacherEligibilityService`** (`app/Services/TeacherEligibilityService.php`, age 18-35 +
  qualification-rank checks) is **not called from anywhere** — defined but unused. If teacher-registration
  eligibility checks are expected to be enforced, they currently aren't.
- **Excel import/export is dead/unrouted**: `app/Exports/TeacherListExport.php`,
  `app/Exports/TeachersTemplateExport.php`, `app/Imports/TeachersImport.php`, and
  `app/Http/Controllers/Excel/TeacherController.php` (`exportTeachers`) exist (backed by
  `config/excel.php`/Maatwebsite Laravel-Excel) but **no route references the Excel controller** — bulk
  teacher import/export is not currently reachable via the API.
- **Queues/events are entirely unused**: `app/Jobs`, `app/Events`, `app/Listeners` are empty;
  `config/queue.php` defaults to `database` and the `jobs`/`failed_jobs` tables exist from migrations, but
  nothing dispatches a job. Mail (`ResetPasswordMail`, `SendUserPassword`) is sent synchronously.
- **No automated tests**: `pestphp/pest` is installed (`composer.json`) and `tests/Pest.php` exists, but
  there are currently no test files.

---

## 9. Configuration & environment reference

Beyond WSO2/auth (§§2-3) and activity logging (§7.2), these `config/*.php` files matter operationally:

| Config | Default | Env vars | Notes |
|---|---|---|---|
| `database.php` | `mysql` | `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Standard Laravel. |
| `mail.php` | `log` driver | `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | `log` means mail is written to the log file, not sent — check `MAIL_MAILER` before assuming `ResetPasswordMail`/`SendUserPassword` (§6.2) reach a real inbox. Sent **synchronously**, no queue. |
| `queue.php` | `database` | `QUEUE_CONNECTION` | `jobs`/`failed_jobs` tables exist but unused — see §8. |
| `logging.php` | `stack` → `single` | `LOG_CHANNEL`, `LOG_LEVEL`, `LOG_STACK`, `LOG_DAILY_DAYS`, `LOG_SLACK_WEBHOOK_URL` | Plain Monolog, writes to `storage/logs/laravel.log` by default. No external error tracking (Sentry etc) integrated. |
| `filesystems.php` | `local` | `FILESYSTEM_DISK` | See §7.7 for the avatar-disk caveat (`profile_photo_disk` ignores this). |
| `session.php` | `database` | `SESSION_DRIVER`, `SESSION_LIFETIME`, `SESSION_ENCRYPT` | Largely irrelevant — the API is stateless/JWT (§2.1); sessions only matter for the dead OIDC web flow (§2.3). |
| `cors.php` | wide open | — | See §2.4. |
| `permission.php` | — | — | Spatie config; table names for roles/permissions (§4.6). |
| `excel.php` | Maatwebsite Laravel-Excel | — | Backs `app/Exports`/`app/Imports` — currently unrouted/dead, see §8. |
| `tcpdf.php` / `pdf.php` | — | — | PDF library config behind `TeacherPdf::generateSimplePdf` (§6.8). |
| `scramble.php` | — | `API_VERSION` | OpenAPI generation — see §11. |

`docker-stack.yml`'s `backend.command` runs `php artisan migrate:fresh --seed --force` on **every
container start** (see §10) — this wipes `DB_DATABASE` every restart. In any shared environment,
`DB_DATABASE` must point at a database nobody minds losing, and `MAIL_MAILER` shouldn't be silently `log`
if real emails are expected.

---

## 10. Database: migrations & seeders

- **Migrations** (`database/migrations/`, ~100 files, chronologically named) build up the schema in
  roughly this order: Laravel defaults (users/jobs/cache) → lookup/reference tables → geography → office
  hierarchy → people/appointments/role-detail tables → timetable tables → Spatie permission tables →
  activity log → recent additions (`teacher_role_transitions`, `employer_appointment_reject_comments`,
  `people.uuid` — §4.1). Run in filename (timestamp) order; standard Laravel migration mechanics, nothing
  bespoke.
- **Seeders** (`database/seeders/`, ~50 files), all called from `DatabaseSeeder::run()` in a fixed order:
  1. Lookup/reference data (religion, blood group, ethnicity, title, civil status, gender, education
     qualifications & grades).
  2. Geography (provinces, districts, DS offices, GN divisions, cities, police stations, MOH areas).
  3. Office hierarchy (office levels, authorities, MOE → PMOE → PEO → ZEO → DEO — §4.3).
  4. Institution lookups + `InstitutionTableSeederPart1` + `WorkplacesFromMinistrySeeder` (institutions as
     `Workplaces` rows).
  5. Service/position/teacher-type/recruitment-category lookups.
  6. **Identity/demo data**: `SuperAdminSeeder`, `PeopleSeeder`, `RolePermissionSeeder` (roles +
     permissions + `roles.level`, §4.6), `UserSeeder`, `DeoOfficerSeeder`, `TeacherSeeder*` (3 variants).
- **`migrate:fresh --seed --force` runs on every backend container start** (`docker-stack.yml`). Locally
  this is the *only* way the DB gets populated — there's no separate "first run" step. Changing this
  command is destructive in prod (see root `CLAUDE.md`'s hard rules).
- `InstitutionTableSeederPart2` and a couple of `User::factory(...)` calls are commented out in
  `DatabaseSeeder` — not currently part of the seed.

---

## 11. API documentation (`api.json` / Scramble)

`dedoc/scramble` (`config/scramble.php`) auto-generates an OpenAPI spec from `routes/api.php` + controller
method signatures/PHPDoc + Form Request `rules()`:

- Served live at `/docs/api` (Stoplight Elements UI).
- Exported to `api.json` at the backend root — this **is checked into the repo** as a generated artifact;
  regenerate via Scramble's export command rather than hand-editing it.
- `config('scramble.servers')` hardcodes a `Production` server URL
  (`https://api-uat.emis.moe.gov.lk/api`) — update if the UAT host changes.
- `AppServiceProvider::boot()` registers a Bearer-token security scheme on the generated spec (matches
  `JwtGuard`'s `Authorization: Bearer <jwt>` expectation, §2.1) and restricts route discovery to `api/*`.
- Coverage quality depends on type hints/PHPDoc/Form Requests being present — controllers using bare
  `$request->validate()` with no return-type annotations (§7.6) produce thinner spec entries than ones
  using Form Request classes.

---

## 12. Testing

`pestphp/pest` (+ `mockery`, `fakerphp/faker`) is installed (`composer.json` require-dev) and
`tests/Pest.php`/config exist, but **`tests/` currently has no test files** — there is no automated test
suite to run or extend yet. If you add tests: `php artisan test` / `./vendor/bin/pest`, using a separate
`.env.testing` DB connection — don't point tests at a database that also gets `migrate:fresh`'d by the dev
container (§10).

---

## 13. Request lifecycle walkthrough: confirming a teacher appointment

Tying together §§2, 3, 5, 6.4 with one concrete example — `PATCH /teachers/{people_id}/confirm`:

1. **CORS preflight** (if browser): `config/cors.php` allows any origin/method/header (§2.4).
2. **Routing**: `routes/api.php` maps to `EmployerAppointmentConfirmationController::confirmTeacher`,
   behind `auth:jwt`.
3. **`JwtGuard`** (§2.1): validates the bearer JWT against WSO2 IS's cached JWKS, reads `jwt_roles` from
   the `roles` claim, resolves `People::where('uuid', $sub)` → `User::where('people_id', ...)`. Any
   missing piece → `401` via the custom exception renderer (§2.4).
4. **Authorization** (in-controller, §5): checks `resolvedRoles($request)` for an allowed role
   (`super admin` / `zonal deo(+head)` / `zonal director` / `development officer`), and
   `resolveUserZonalWorkplaceId()` to confirm the target `People`'s appointment is in the caller's zone.
5. **Business logic**, inside a `DB::transaction`:
   - `EmployerAppointment.is_confirmed = 1`.
   - `TeacherAccountProvisioningService::provisionFromPerson()` (§3.2): creates/updates the `User` row
     (default password derived from NIC, `must_change_password = true`, Spatie role assigned).
   - → `Wso2IsProvisioningService::provisionUser()` (§3.1): creates the SCIM2 user in WSO2 IS, stamps
     `users.identity_provider_user_id` and **`people.uuid`** — the value `JwtGuard` later matches against
     the JWT `sub` claim for this person.
6. **Response**: JSON with the updated appointment + provisioning result.

> **Gotcha**: `Wso2IsProvisioningService::provisionUser` catches its own exceptions and returns
> `{provisioned: false, error: ...}` (or `{enabled: false}` if `WSO2_ENABLED=false`) instead of throwing.
> Because this happens *inside* the `DB::transaction`, **the local `User`/role changes are committed even
> if the WSO2 IS call fails** — `people.uuid` can end up unset while `users.identity_provider = 'local'`.
> If a newly-confirmed user can't log in via IS, this is the first place to check.
