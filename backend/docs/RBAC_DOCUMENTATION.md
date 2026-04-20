# RBAC Technical Documentation — EMIS-LK

> Generated from static analysis of source files. No assumptions beyond actual code found.
> References: `database/seeders/RolePermissionSeeder.php`, `database/seeders/SuperAdminSeeder.php`,
> `app/Models/User.php`, `app/Policies/ViewRestrictPolicy.php`, `app/Providers/AuthServiceProvider.php`,
> `routes/web.php`, `routes/teacher.php`, `routes/myprofile.php`, `routes/alerts.php`,
> `app/Livewire/Users/UserIndex.php`, `app/Livewire/Alerts/`, `bootstrap/app.php`, `config/permission.php`

---

## Table of Contents

1. [RBAC Architecture Overview](#1-rbac-architecture-overview)
2. [Permission Naming Convention](#2-permission-naming-convention)
3. [Module-Based Permission Breakdown](#3-module-based-permission-breakdown)
4. [Roles & Their Access Scope](#4-roles--their-access-scope)
5. [Authorization Flow](#5-authorization-flow)
6. [Database Structure](#6-database-structure)
7. [Security Observations](#7-security-observations)
8. [Complete Authorization Coverage Summary](#8-complete-authorization-coverage-summary)

---

## 1. RBAC Architecture Overview

### Implementation

This project implements Role-Based Access Control using **Spatie Laravel Permission v6.21** (`spatie/laravel-permission: ^6.21`). RBAC is not custom-built — it is entirely powered by this package's first-class Laravel integration.

### How Roles, Permissions & Users Are Connected

```
User (users table)
  └── assigned to one or more → Role (roles table)
                                    └── has many → Permission (permissions table)
                                                         [via role_has_permissions pivot]
  └── (optionally) directly assigned → Permission
                                         [via model_has_permissions pivot]
```

The `User` model (`app/Models/User.php`, line 20) uses the `HasRoles` trait:

```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, LogsActivity, Blameable;
}
```

This trait provides all runtime methods: `hasRole()`, `hasPermissionTo()`, `assignRole()`, `syncPermissions()`, `can()`, etc.

### Middleware Registration

Registered in `bootstrap/app.php` (Laravel 11 style — no `Kernel.php`):

```php
'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
```

> **Note:** `role_or_permission` is registered but **never used** anywhere in the codebase.

### Three Layers of Authorization

| Layer | Mechanism | Where Used |
|---|---|---|
| Route-level | `permission:xxx` / `role:xxx` middleware | `routes/web.php` and all module route files |
| Component-level | `$this->authorize('viewRestrict', $people)` | 50+ Livewire profile components |
| Logic-level | `auth()->user()->can($permission)`, `hasRole()` | Livewire Alerts & UserIndex components |
| View-level | `@can`, `@canany`, `@role` Blade directives | 45+ Blade view files |

---

## 2. Permission Naming Convention

All permissions follow a consistent **dot-notation** structure:

```
{module}.{sub-module?}.{context?}.{action}
```

### Pattern Breakdown

| Segment | Purpose | Examples |
|---|---|---|
| `module` | Top-level feature area | `teacher`, `principal`, `sleas`, `office`, `user`, `institution` |
| `sub-module` | Functional section within the module | `profile`, `list`, `bulk`, `employment`, `qualification` |
| `context` | Optional further scoping | `general`, `current-appointment`, `services-history`, `moe`, `deo` |
| `action` | The operation being authorized | `view`, `create`, `update`, `delete`, `verify`, `confirm`, `pdf`, `upload`, `response` |

### Action Types Catalogue

| Action | Meaning |
|---|---|
| `view` | Read-only access to a page or data |
| `create` | Access to creation form / insert operation |
| `update` | Edit existing data |
| `delete` | Remove a record |
| `verify` | Verify (first-level approval) a profile |
| `confirm` | Confirm (second-level approval) a profile |
| `response` | Respond to an edit request |
| `pdf` | Export/generate a PDF document |
| `upload` | Bulk upload via Excel/CSV |
| `reset` | Password reset action |

### Examples Across Levels

```
dashboard.main.view                                    # simple: module.sub.action
teacher.list.view                                      # list view
teacher.profile.general.view                           # nested profile section
teacher.profile.employment.current-appointment.update  # deeply nested action
teacher.bulk.upload                                    # top-level bulk action
office.moe.profile.overview.view                       # office type scoped
cadre-dms-approved.index.view                          # hyphenated module name
```

---

## 3. Module-Based Permission Breakdown

### Module 1 — Dashboard & Common

**Purpose:** Core dashboard access and shared classroom resources.

| Permission | Action |
|---|---|
| `dashboard.main.view` | Access main dashboard |
| `student.list.view` | View student list |
| `attendance.list.view` | View attendance |
| `attendance.manage.update` | Manage attendance |
| `exam.result.view` | View exam results |
| `exam.term_test.manage` | Manage term tests |
| `resource.list.view` | View resources |
| `resource.manage.update` | Manage resources |
| `resource.allocation.create` | Create resource allocation |
| `resource.allocation.view` | View resource allocation |

---

### Module 2 — My Profile

**Purpose:** Each authenticated user's own profile self-management.

**View (6 permissions):**

| Permission |
|---|
| `my-profile.general.view` |
| `my-profile.qualification.view` |
| `my-profile.employment.view` |
| `my-profile.family.view` |
| `my-profile.pension-and-payment.view` |
| `my-profile.edit-request.view` |

**Management (5 permissions):**

| Permission |
|---|
| `my-profile.edit-request.create` |
| `my-profile.edit-request.response` |
| `my-profile.verify` |
| `my-profile.confirm` |
| `my-profile.pdf.view` |

**Data Update Actions (14 permissions):**

| Permission |
|---|
| `my-profile.personal-cultural.update` |
| `my-profile.health.update` |
| `my-profile.contact-information.update` |
| `my-profile.location-information.update` |
| `my-profile.temporary-location-information.update` |
| `my-profile.qualification.create` |
| `my-profile.qualification.delete` |
| `my-profile.employment.current-appointment.update` |
| `my-profile.employment.first-appointment.update` |
| `my-profile.employment.sltes-information.update` |
| `my-profile.employment.previous-service.create` |
| `my-profile.employment.previous-service.delete` |
| `my-profile.employment.services-history.create` |
| `my-profile.employment.services-history.delete` |
| `my-profile.pension-and-payment.update` |
| `my-profile.family.create` |
| `my-profile.family.delete` |

---

### Modules 3–11 — Staff Service Modules

Each of the 9 staff service modules follows an **identical permission template**.

**Module prefixes:**

| Prefix | Full Name |
|---|---|
| `teacher` | Teacher |
| `principal` | Principal |
| `dos` | Development Officer of Schools |
| `mso` | Management Service Officer |
| `sleas` | Sri Lanka Education Administrative Service |
| `sltas` | Sri Lanka Teacher Advisor Service |
| `sltes` | Sri Lanka Technical Education Service |
| `slas` | Sri Lanka Administrative Service |
| `slacs` | Sri Lanka Accountancy Service |

**Permission template per module (substitute `{module}` with prefix above):**

| Category | Permission Pattern | Count |
|---|---|---|
| List management | `{module}.list.view`, `{module}.create`, `{module}.update`, `{module}.delete` | 4 |
| Profile view | `{module}.profile.general.view`, `.qualification.view`, `.employment.view`, `.family.view`, `.pension-and-payment.view`, `.edit-request.view` | 6 |
| Profile management | `{module}.profile.edit-request.create`, `.edit-request.response`, `.verify`, `.confirm`, `.id.view`, `.pdf.view` | 6 |
| Bulk actions | `{module}.bulk.upload` | 1 |
| Profile updates | `.personal-cultural.update`, `.health.update`, `.contact-information.update`, `.location-information.update`, `.temporary-location-information.update` | 5 |
| Qualification CRUD | `.profile.qualification.create`, `.profile.qualification.delete` | 2 |
| Employment CRUD | `.profile.employment.current-appointment.update`, `.first-appointment.update`, `.{module}-information.update`, `.previous-service.create`, `.previous-service.delete`, `.services-history.create`, `.services-history.delete` | 7 |
| Pension & family | `.profile.pension-and-payment.update`, `.profile.family.create`, `.profile.family.delete` | 3 |

**Per module total: ~34 permissions × 9 modules = ~306 permissions**

---

### Module 12 — User Management

**Purpose:** Manage system user accounts.

| Permission |
|---|
| `user.list.view` |
| `user.create` |
| `user.update` |
| `user.password.reset` |
| `user.status.update` |
| `user.delete` |
| `user.edit` |

---

### Module 13 — Institution Management

**Purpose:** Manage schools/institutions and their profiles.

| Permission |
|---|
| `institution.list.view` |
| `institution.create` |
| `institution.update` |
| `institution.profile.view` |
| `institution.profile.overview.view` |
| `institution.profile.staff.view` |
| `institution.profile.report-module.view` |
| `institution.profile.report-module.pdf` |
| `institution.profile.report-module.xls` |
| `institution.basic_information.update` |
| `institution.contact_details.update` |
| `institution.location_administration.update` |
| `institution.mission_vision.update` |

---

### Module 14 — Office Management (MOE / PMOE / PEO / ZEO / DEO)

**Purpose:** Manage the 5-tier educational office hierarchy.

Permissions follow `office.{type}.{action}` where `type` ∈ `{moe, pmoe, peo, zeo, deo, institution}`:

| Category | Permissions |
|---|---|
| Lists | `office.{type}.list.view` ×6 |
| Create | `office.{type}.create` ×6 |
| Profile overview | `office.{type}.profile.overview.view` ×5 |
| Update | `office.{type}.update` ×6 |
| Delete | `office.{type}.delete` ×6 |
| Institution profile tabs | `office.institution.profile.overview.view`, `.profile.view`, `.staff.view`, `.report-module.view`, `.report-module.pdf`, `.report-module.xls` |

---

### Module 15 — Subjects

**Purpose:** Manage appointment and teaching subjects.

| Permission |
|---|
| `appointment_subject.list.view` |
| `appointment_subject.create` |
| `appointment_subject.update` |
| `appointment_subject.delete` |
| `appointment_subject.view` |
| `teaching_subject.list.view` |
| `teaching_subject.create` |
| `teaching_subject.update` |
| `teaching_subject.delete` |
| `teaching_subject.view` |

---

### Module 16 — Cadre DMS Approved

**Purpose:** Manage cadre/DMS approved records per institution.

| Permission |
|---|
| `cadre-dms-approved.index.view` |
| `cadre-dms-approved.add` |
| `cadre-dms-approved.institution.view` |
| `cadre-dms-approved.edit` |
| `institution.profile.cadre-dms-approved.view` |
| `office.institution.profile.cadre-dms-approved.view` |

---

### Module 17 — Alerts

**Purpose:** Access to the alerts overview panel.

| Permission |
|---|
| `alerts.overview.view` |

---

## 4. Roles & Their Access Scope

### Role Inventory

| Role Name | Guard | Access Level | Case |
|---|---|---|---|
| `super admin` | web | Full — all 170+ permissions | lowercase |
| `teacher` | web | Restricted — 10 common permissions | lowercase |
| `principal` | web | Restricted — 10 common permissions | lowercase |
| `development officer` | web | Restricted — 10 common permissions | lowercase |
| `management assistant` | web | Restricted — 10 common permissions | lowercase |
| `sleas officer` | web | Restricted — 10 common permissions | lowercase |
| `Teacher Advisor` | web | Restricted — 10 common permissions | **Title Case** ⚠️ |
| `Administrative Service` | web | Restricted — 10 common permissions | **Title Case** ⚠️ |
| `Accountancy Service` | web | Restricted — 10 common permissions | **Title Case** ⚠️ |

---

### Role: `super admin`

**Purpose:** System-wide administrator with unrestricted access.

**Defined in:** `database/seeders/RolePermissionSeeder.php` line 680; `database/seeders/SuperAdminSeeder.php` line 21.

**Permission assignment:**
```php
$superAdminRole->syncPermissions(Permission::all()); // all 170+ permissions
```

**Special privileges:**
- Only role that can access `/roles/*` route group (`role:super admin` middleware)
- Only role that can access `/main-tables/*` route group (`role:super admin` middleware)
- `UserIndex` shows all users system-wide for this role; other roles see only their workplace hierarchy

**Super Admin seed credentials:**

| Field | Value |
|---|---|
| NIC | `999999999999` |
| Email | `superadmin@example.com` |
| Password | `password@*` |
| Workplace | `MOE0000001` (Ministry of Education) |

---

### Roles: All 8 Service Roles

**Purpose:** Role placeholders for staff members of each service type. Currently all have the **same 10 permissions**:

```
dashboard.main.view
student.list.view
attendance.list.view
attendance.manage.update
exam.result.view
exam.term_test.manage
resource.list.view
resource.manage.update
resource.allocation.create
resource.allocation.view
```

> **Important:** These permissions cover only the basic classroom/dashboard area. All profile management, staff management, office management, institution, and administrative permissions are **not yet assigned** to any non-admin role — meaning those routes are only accessible to `super admin` at present.

---

## 5. Authorization Flow

### Full Request Flow

```
HTTP Request
    │
    ▼
Route Definition (routes/web.php or module route file)
    │
    ├─── auth middleware → redirects to login if unauthenticated
    │
    ├─── permission:{name} middleware (Spatie)
    │       └── checks: user → roles → permissions
    │       └── supports pipe OR: permission:perm1|perm2
    │       └── on failure: 403 Forbidden
    │
    ├─── role:{name} middleware (Spatie)
    │       └── checks: user → role name match
    │       └── on failure: 403 Forbidden
    │
    ▼
Livewire Component Renders
    │
    ├─── $this->authorize('viewRestrict', $people)     [Policy check]
    │       └── ViewRestrictPolicy::viewRestrict()
    │       └── verifies user's workplace includes target person's workplace
    │       └── on failure: AuthorizationException → 403
    │
    ├─── auth()->user()->can($permission)              [Per-item filtering]
    │       └── used in Alerts to filter visible service types
    │
    └─── $loggedUser->hasRole('super admin')           [Role-specific logic branch]
             └── used in UserIndex to change data scope
```

---

### Layer 1 — Route Middleware

**`permission:{name}`** — used on 124+ individual routes:

```php
// Single permission
->middleware(['permission:teacher.list.view'])

// OR-combined permissions (pipe separator — user needs ANY one)
->middleware(['permission:institution.profile.profile.view|office.institution.profile.profile.view'])

// Multi-permission OR for alerts
->middleware([
    'permission:teacher.profile.verify|principal.profile.verify|dos.profile.verify|...'
])

// Group-level middleware
Route::middleware(['permission:teacher.bulk.upload'])->group(function () { ... });
```

**`role:{name}`** — used in 2 route groups:

```php
// routes/web.php line 408 — Role management UI
Route::middleware(['role:super admin'])->group(function () {
    Route::get('roles', RoleIndex::class)->name('roles.index');
    Route::get('roles/create', RoleCreate::class)->name('roles.create');
    Route::get('roles/{id}/edit', RoleEdit::class)->name('roles.edit');
});

// routes/mainTable.php line 47 — Reference data management (30+ routes)
Route::middleware(['role:super admin'])->group(function () {
    // blood groups, civil status, districts, ethnicities, etc.
});
```

---

### Layer 2 — Policy Authorization (Workplace Hierarchy)

**Policy:** `app/Policies/ViewRestrictPolicy.php`

**Registered in:** `app/Providers/AuthServiceProvider.php`
```php
protected $policies = [
    People::class => ViewRestrictPolicy::class,
];
```

**Policy logic:**
```php
public function viewRestrict(User $user, People $people): bool
{
    if (!$user->workplace) {
        return false;
    }
    $allowedWorkplaceIds = $user->workplace->getAllChildWorkplaces();
    return in_array($people->currentAppointment->workplace_id, $allowedWorkplaceIds);
}
```

**Called in:** 50+ Livewire profile components across all 9 service modules. Every profile sub-page calls:
```php
$this->authorize('viewRestrict', $people);
```

This ensures a user can only view profiles of people belonging to their own workplace or its child workplaces in the hierarchy.

---

### Layer 3 — Logic-Level Checks

**Alert filtering** (`app/Livewire/Alerts/AlertsOverview.php`, `PendingVerification.php`, `PendingConfirmation.php`):
```php
->filter(fn ($service, $permission) => auth()->user()->can($permission))
```

**User data scope** (`app/Livewire/Users/UserIndex.php` line 31):
```php
if ($loggedUser->hasRole('super admin')) {
    // loads all users system-wide
} else {
    // loads only users within user's workplace hierarchy
}
```

---

### Layer 4 — View-Level Checks (Blade)

**`@can` / `@canany`** — used in 45 Blade files to conditionally render UI elements (buttons, tabs, action menus):

```php
// Single permission
@can('teacher.profile.edit-request.create')
    <button>Request Edit</button>
@endcan

// Any of multiple permissions (alerts layout)
@canany(['teacher.profile.confirm', 'principal.profile.confirm', 'dos.profile.confirm', ...])
    {{-- Show confirmation tab --}}
@endcanany
```

**`@role`** — used once in the sidebar:
```php
// resources/views/components/layouts/app/sidebar.blade.php line 152
@role('super admin')
    {{-- Admin-only sidebar items --}}
@endrole
```

---

### Dashboard Authorization

`DashboardController.php` performs **no permission or role checks**. Instead it branches on `$workplace->office_level_id` to determine what hierarchy data to show:

| Office Level ID | Office Type | Data Shown |
|---|---|---|
| `OLID001` | MOE | PMOE → ZEO → DEO → Institution counts |
| `OLID002` | PMOE | PEO → ZEO → DEO → Institution counts |
| `OLID003` | PEO | ZEO → DEO → Institution counts |
| `OLID004` | ZEO | DEO → Institution counts |
| `OLID005` / `OLID006` | DEO / Institution | Institution → Staff counts |

---

## 6. Database Structure

### Tables Created by Spatie Permission

**Migration:** `database/migrations/2025_08_24_025456_create_permission_tables.php`

| Table | Primary Key | Columns | Purpose |
|---|---|---|---|
| `permissions` | `id` (bigint) | `name`, `guard_name`, timestamps | Stores all permission records |
| `roles` | `id` (bigint) | `name`, `guard_name`, timestamps | Stores all role records |
| `model_has_roles` | composite | `role_id`, `model_type`, `model_id` | Links User model to roles |
| `model_has_permissions` | composite | `permission_id`, `model_type`, `model_id` | Direct user-to-permission link |
| `role_has_permissions` | composite | `permission_id`, `role_id` | Links roles to permissions |

### Entity Relationship

```
users
  id ─────────────────────────────────────────────────────────┐
                                                               │
model_has_roles                                                │
  model_type = 'App\Models\User'                               │
  model_id ────────────────────────────────────────────────► users.id
  role_id  ────────────────────────────────────────────────► roles.id

role_has_permissions
  role_id      ────────────────────────────────────────────► roles.id
  permission_id ───────────────────────────────────────────► permissions.id
```

### Cache Configuration (`config/permission.php`)

| Setting | Value |
|---|---|
| Cache expiration | 24 hours |
| Cache key | `spatie.permission.cache` |
| Cache store | `default` |
| Teams feature | Disabled |
| Wildcard permissions | Disabled |
| Events enabled | Disabled |
| Display permission in exception | `false` (security) |
| Display role in exception | `false` (security) |

The seeder manually clears the cache before seeding:
```php
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
```

---

## 7. Security Observations

### 1. Non-Admin Roles Are Effectively Hollow

All 8 service roles are assigned the same 10 dashboard/classroom permissions. The 160+ staff profile management, office management, institution, and user permissions are defined but **not assigned to any non-admin role**. In practice, only `super admin` can access most of the application's functionality.

**Affected file:** `database/seeders/RolePermissionSeeder.php` lines 684–802.

---

### 2. API Routes Are Fully Public ⚠️

`routes/api.php` exists (103 lines) and the authentication middleware is **commented out**:

```php
// Route::middleware('auth:sanctum')->group(...)  ← commented out
```

All API endpoints are publicly accessible without any authentication or permission check, including endpoints that expose teacher data, institution data, office lists, and CRUD operations.

**Risk:** Any unauthenticated actor can read and potentially modify data via the API.

---

### 3. Role Name Case Inconsistency

Three roles use Title Case while the rest use lowercase. Spatie performs **case-sensitive** role name comparisons, making any `hasRole('teacher advisor')` check silently fail for the `Teacher Advisor` role.

| Role Name | Case |
|---|---|
| `super admin` | lowercase ✓ |
| `teacher` | lowercase ✓ |
| `principal` | lowercase ✓ |
| `development officer` | lowercase ✓ |
| `management assistant` | lowercase ✓ |
| `sleas officer` | lowercase ✓ |
| `Teacher Advisor` | **Title Case ⚠️** |
| `Administrative Service` | **Title Case ⚠️** |
| `Accountancy Service` | **Title Case ⚠️** |

**Affected file:** `database/seeders/RolePermissionSeeder.php` lines 759, 775, 790.

---

### 4. Routes Without Permission Middleware

Several routes in the office profile section have **no permission middleware** while their sibling routes do:

```php
// Has middleware ✓
Route::get('offices/moe/{id}/profile/overview', MoeOverview::class)
    ->middleware(['permission:office.moe.profile.overview.view']);

// No middleware ✗ — only 'auth' required
Route::get('offices/moe/{id}/profile/moefprofile', MoeProfile::class);
Route::get('offices/moe/{id}/profile/staff', MoeStaff::class);
Route::get('offices/moe/{id}/profile/dms-cadre-summary', MoeDmsCadreSummary::class);
```

The same pattern repeats for **PMOE, PEO, ZEO, and DEO** office sub-pages (`profile`, `staff`, `dms-cadre-summary` tabs). Any authenticated user can access them regardless of role or permissions.

---

### 5. `alerts.overview` Route Has No Permission Middleware

```php
// routes/alerts.php line 17
Route::get('alerts/overview', AlertsOverview::class)->name('alerts.overview');
// ← only 'auth' middleware, no permission check
```

The permission `alerts.overview.view` is defined in the seeder but **never enforced at the route level**. Any authenticated user can reach the alerts overview page. The component filters visible items using `can()`, but the page itself is unprotected.

---

### 6. No Super Admin Policy Bypass

`ViewRestrictPolicy` does **not** include a `before()` gate to auto-grant super admin access:

```php
// Missing:
public function before(User $user, string $ability): bool|null
{
    if ($user->hasRole('super admin')) return true;
    return null;
}
```

This means `super admin` users are also subject to workplace hierarchy checks when accessing profile pages. The super admin's workplace `MOE0000001` must cover all child workplaces via `getAllChildWorkplaces()` for full access to work correctly.

---

### 7. `$managementAssistantRole` Variable Reused

In `RolePermissionSeeder.php` lines 744–771, the variable `$managementAssistantRole` is reused for three different roles (`sleas officer`, `Teacher Advisor`). While functionally harmless, it reduces code clarity and creates maintenance risk.

```php
// Line 729
$managementAssistantRole = Role::firstOrCreate(['name' => 'management assistant']);

// Line 744 — variable reused for a different role
$managementAssistantRole = Role::firstOrCreate(['name' => 'sleas officer']);

// Line 759 — reused again
$managementAssistantRole = Role::firstOrCreate(['name' => 'Teacher Advisor']);
```

---

### 8. `role_or_permission` Middleware Registered but Unused

The `role_or_permission` middleware alias is registered in `bootstrap/app.php` but has **zero usages** in any route file. This is dead configuration.

---

## 8. Complete Authorization Coverage Summary

| Mechanism | Count | Location |
|---|---|---|
| `permission:` route middleware | 124+ routes | All module route files |
| `role:super admin` middleware | 2 groups | `web.php`, `mainTable.php` |
| `$this->authorize('viewRestrict')` | 50+ components | All service module Livewire profiles |
| `auth()->user()->can($permission)` | 6 calls | Alert Livewire components |
| `hasRole('super admin')` | 1 call | `UserIndex.php` |
| `@can` / `@canany` | 45 Blade files | All list/profile views |
| `@role('super admin')` | 1 call | `sidebar.blade.php` |
| `role_or_permission` middleware | **0 usages** | Registered but never used |
| Custom `Gate::` definitions | **0** | None exist |
| PHP 8.1 native enums for permissions | **0** | None exist |
| API route protection | **0** | All API routes are public ⚠️ |

---

*End of RBAC Technical Documentation*
