# RBAC Technical Documentation — EMIS-LK

> Generated from static analysis of the current pure-JSON API backend.
> The previous version of this document described an older Livewire/Blade
> application (`routes/web.php`, `routes/teacher.php`, `routes/myprofile.php`,
> `routes/alerts.php`, `routes/mainTable.php`). That application is now dead
> code — `routes/web.php` is entirely commented out, and the other route
> files no longer exist. This document describes how authorization actually
> works in the current `routes/api.php` + `app/Http/Controllers/API/*` stack.
>
> References: `routes/api.php`, `bootstrap/app.php`, `app/Auth/JwtGuard.php`,
> `app/Traits/ResolvesZonalScope.php`, `app/Models/User.php`,
> `app/Http/Controllers/API/*.php`, `app/Policies/ViewRestrictPolicy.php`,
> `app/Providers/AuthServiceProvider.php`,
> `database/seeders/RolePermissionSeeder.php`, `database/seeders/SuperAdminSeeder.php`,
> `database/migrations/2026_04_27_000001_add_level_to_roles_table.php`,
> `config/permission.php`
>
> See also [`ARCHITECTURE.md`](ARCHITECTURE.md) for the broader request flow
> (JWT issuance, IS provisioning, etc.).

---

## Table of Contents

1. [RBAC Architecture Overview](#1-rbac-architecture-overview)
2. [Authentication: How a Request Gets Roles](#2-authentication-how-a-request-gets-roles)
3. [Roles & the `roles.level` Hierarchy](#3-roles--the-roleslevel-hierarchy)
4. [Authorization Patterns Used in Controllers](#4-authorization-patterns-used-in-controllers)
5. [Per-Endpoint Authorization Reference](#5-per-endpoint-authorization-reference)
6. [Zonal Scoping](#6-zonal-scoping)
7. [Spatie Permissions: Status & Catalogue](#7-spatie-permissions-status--catalogue)
8. [`ViewRestrictPolicy` — Dead Code](#8-viewrestrictpolicy--dead-code)
9. [Database Structure](#9-database-structure)
10. [Known Gaps / Observations](#10-known-gaps--observations)

---

## 1. RBAC Architecture Overview

The current API does **not** use Spatie's `permission:` / `role:` route
middleware, policies, or Blade directives. Authorization is implemented as
**explicit, in-controller role-name checks** against a list of roles resolved
from the JWT and the local database.

```
HTTP Request (Bearer JWT)
    │
    ▼
auth:jwt middleware (app/Auth/JwtGuard.php)
    │  - validates JWT against WSO2 IS JWKS
    │  - resolves People.uuid == JWT 'sub' claim → User
    │  - stores JWT 'roles' claim on request as 'jwt_roles'
    │  - on failure → 401 Unauthenticated
    ▼
Controller method
    │  - $roles = $this->resolvedRoles($request)   (merges jwt_roles + DB Spatie roles)
    │  - if (! $this->hasAnyRole($roles, [...allowed...])) → 403 Unauthorized
    │  - optionally: zonal scoping via ResolvesZonalScope
    │  - optionally: roles.level hierarchy comparison (UserApiController only)
    ▼
Response
```

There is **no route-level `permission:`/`role:` middleware** anywhere in
`routes/api.php`. Spatie's `roles`/`permissions` tables still exist and are
seeded (see [§7](#7-spatie-permissions-status--catalogue)), and `roles.level`
is used for one specific hierarchy check, but Spatie's `hasPermissionTo()` /
`can()` / `Gate::` are **not used for authorization decisions** anywhere in
`app/Http/Controllers/API`.

---

## 2. Authentication: How a Request Gets Roles

### `auth:jwt` middleware

Almost every route in `routes/api.php` is protected with `->middleware('auth:jwt')`,
which resolves to `App\Auth\JwtGuard` (registered as guard driver `jwt` in
`config/auth.php`).

`JwtGuard::user()`:
1. Reads the `Authorization: Bearer <token>` header.
2. Validates the JWT signature against WSO2 IS's JWKS (`config('auth.jwks_uri')`, cached 1 hour).
3. Reads the `roles` claim from the JWT payload and stores it on the request as `jwt_roles` (`$request->attributes->set('jwt_roles', $roles)`).
4. Reads the `sub` claim (a UUID), looks up `People::where('uuid', $uuid)`, then `User::where('people_id', $person->people_id)`.
5. Stores `jwt_uuid` and `jwt_people_id` on the request attributes.
6. Returns the resolved `User` (or `null` → 401).

A few routes are intentionally public (no `auth:jwt`): `/login`, `/test`,
lookup/reference-data endpoints (`/apointed-subjects`, `/authorities`,
`/blood-groups`, `/titles`, `/teacher-types`, `/teacher-categories`,
`/services`, `/service-ranks`, `/subjects`, `/moe-list`, `/pmoe-list`,
`/peo-list`, `/office/{type}/{workplace_id}`), and `/permissions*`. This is
intentional — these are read-only reference/lookup endpoints — but it should
be confirmed that none of them leak sensitive data (see [§10](#10-known-gaps--observations)).

### Resolving roles for a request — `resolvedRoles()`

Defined in `app/Traits/ResolvesZonalScope.php` (and duplicated locally in
`PrincipalApiController`):

```php
protected function resolvedRoles(Request $request): array
{
    $jwtRoles = (array) $request->attributes->get('jwt_roles', []);
    $dbRoles  = $request->user()?->getRoleNames()?->all() ?? [];

    return collect(array_merge($jwtRoles, $dbRoles))
        ->filter(fn ($role) => is_string($role) && trim($role) !== '')
        ->map(fn (string $role) => strtolower(trim(preg_replace('/\s+/', ' ', $role) ?? $role)))
        ->unique()
        ->values()
        ->all();
}
```

Key points:
- Roles come from **two sources**: the WSO2 IS JWT `roles` claim, **and** the
  local Spatie `model_has_roles` assignment (via `User::getRoleNames()`).
  Either source is sufficient.
- All role names are **lowercased and whitespace-normalized** before
  comparison — this avoids the case-sensitivity problems the old
  Livewire-era seeder had (e.g. `Zonal DEO` vs `zonal deo` both normalize to
  `zonal deo`).

### `hasAnyRole()` / `isSuperAdmin()`

```php
protected function hasAnyRole(array $roles, array $allowedRoles): bool
{
    $allowed = collect($allowedRoles)->map(fn (string $r) => strtolower(trim($r)))->all();
    return ! empty(array_intersect($roles, $allowed));
}

protected function isSuperAdmin(array $roles): bool
{
    return in_array('super admin', $roles, true);
}
```

`UserManagementController` uses a different, simpler check:
`$request->user()?->hasRole('super admin')` — this checks **only** the local
Spatie DB role (not the JWT `roles` claim).

---

## 3. Roles & the `roles.level` Hierarchy

`database/migrations/2026_04_27_000001_add_level_to_roles_table.php` adds an
`unsignedTinyInteger('level')` column to the Spatie `roles` table. **Lower
number = more senior.** It is seeded in `database/seeders/RolePermissionSeeder.php`:

| Role name | `level` | Notes |
|---|---|---|
| `super admin` | 1 | Full Spatie permission set (`Permission::all()`) |
| `SSA` | 1 | Full Spatie permission set |
| `MOE Administrator` | 2 | Full Spatie permission set |
| `Zonal Director` | 3 | "Approve/View" permission set |
| `Zonal Deputy Director` | 4 | "Approve/View" permission set |
| `Zonal Subject Head` | 5 | "Verify" permission set |
| `Zonal DEO HEAD` | 6 | Full CRUD personnel permission set |
| `Zonal DEO` | 7 | Full CRUD personnel permission set |
| `teacher` | 7 | Own-profile permissions only |
| `principal` | 8 | View-teacher / report permissions |

> Note: `teacher` and `Zonal DEO` are both seeded with `level = 7`. This is
> currently harmless for the one place `level` is used (see below) because
> teachers never appear as the "acting" user in that check, but it means
> `level` is **not** a strict total ordering across all roles — treat it as
> "lower is more senior" only within the office-hierarchy roles (super admin
> → MOE Administrator → Zonal Director → ... → Zonal DEO).

### Where `level` is actually used

Only in `UserApiController` (`GET /api/user/{people_id}`), when the
authenticated user requests **someone else's** profile:

```php
$tokenLevel  = $tokenUserRole?->level;   // first role of the requesting user
$targetLevel = $targetRole?->level;      // first role of the profile being viewed

if ($tokenLevel === null || $targetLevel === null || $tokenLevel >= $targetLevel) {
    return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
}
```

i.e. you may only view another user's profile via this endpoint if your role
has a **strictly lower (more senior) `level`** than the target's role. Both
users must have a Spatie role with a non-null `level` — a user with no role,
or a role that doesn't have `level` set, is always denied here.

This uses `$tokenUser?->roles()->first()` — i.e. only the user's **first**
assigned Spatie DB role (not the merged JWT+DB role list, and not "any of
the user's roles").

### Roles referenced by name in API controllers (not all formally seeded with `level`)

Beyond the seeded roles above, controller role checks also reference these
role-name strings (compared case-insensitively via `resolvedRoles()`):

- `development officer`
- `development officer head`
- `zonal deo` *(= `Zonal DEO`, level 7)*
- `zonal deo head` *(= `Zonal DEO HEAD`, level 6)*
- `zonal director` *(= `Zonal Director`, level 3)*
- `teacher`, `principal`, `sleas`

`development officer` / `development officer head` are **not** in
`RolePermissionSeeder.php`'s current role list — they appear to be
legacy/alternate names for the `zonal deo` / `zonal deo head` roles, and are
included in `hasAnyRole()` allow-lists alongside them. If a user is actually
assigned one of these role names (e.g. via WSO2 IS JWT claims), the checks
still work because role matching is by string, not by a fixed enum.

---

## 4. Authorization Patterns Used in Controllers

Three patterns recur across `app/Http/Controllers/API/*`:

### Pattern A — Role allow-list (`hasAnyRole`)

The most common pattern. Resolve roles, then check membership in a
hard-coded allow-list:

```php
$roles = $this->resolvedRoles($request);
if (! $this->hasAnyRole($roles, ['super admin', 'zonal deo', 'zonal deo head'])) {
    return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
}
```

Used throughout `TeacherApiController`, `PrincipalApiController`,
`EmployerAppointmentConfirmationController`, `AlertController`.

### Pattern B — Super-admin-only gate

```php
if (! $this->isSuperAdmin($roles)) {
    return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
}
```
or, in `UserManagementController` (DB role only):
```php
if (! $request->user()?->hasRole('super admin')) { ... }
```

Used for: user management CRUD (`UserManagementController`), and as the
"escape hatch" inside several `EmployerAppointmentConfirmationController`
methods to skip zonal-scope checks.

### Pattern C — Role-conditional data scoping (no rejection)

Some endpoints don't reject unauthorized roles outright — instead they
**branch the query** based on role, e.g. `DeoOfficerController::index()`:

```php
$isSuperAdmin = in_array('super admin', $roles);
if ($isSuperAdmin) {
    // return all DEO officers, unscoped
} else {
    // scope to the caller's zonal area
}
```

Same pattern in `TeacherApiController` (teacher list scoping) and
`AlertController` (alert counts scoped for `development officer`/`zonal deo`
unless also `super admin`).

### Pattern D — `roles.level` hierarchy (UserApiController only)

See [§3](#3-roles--the-roleslevel-hierarchy) above. The only place a numeric
hierarchy comparison is used instead of a name allow-list.

---

## 5. Per-Endpoint Authorization Reference

This table covers routes that have authorization logic **beyond** plain
`auth:jwt`. Routes not listed here only require a valid JWT (any
authenticated user), or are public.

### Teachers — `TeacherApiController`

| Route | Allowed roles | Notes |
|---|---|---|
| `GET /teachers-list` | any authenticated | List is **scoped** for `development officer`/`development officer head`/`zonal deo`/`zonal deo head`/`zonal director` to their zonal area; `super admin` sees all |
| `PATCH /teachers/{people_id}/update` (via confirmation controller) | `development officer`, `development officer head`, `zonal deo`, `zonal deo head` | |
| `PATCH /teachers/{people_id}` (`updateProfile`) | `super admin`, `zonal deo` | |
| `DELETE`-style "reject"/promote actions | `development officer`, `development officer head`, `zonal deo`, `zonal deo head`, `zonal director`, `super admin` | |

### Principals — `PrincipalApiController`

| Route | Allowed roles |
|---|---|
| `POST /principal-create` | `super admin`, `zonal deo`, `zonal deo head` (`canManagePrincipals()`) |
| `principals/{people_id}/service-history`, `/past-services` | `super admin`, `zonal deo`, `zonal deo head`, `development officer`, `development officer head` |

### Verification / Confirmation — `EmployerAppointmentConfirmationController`

| Route | Allowed roles | Additional check |
|---|---|---|
| `PATCH /teachers/{people_id}/verify` | `development officer`, `development officer head`, `zonal deo`, `zonal deo head`, `super admin` | Non-super-admins must pass `teacherBelongsToUserZonalArea()` (see [§6](#6-zonal-scoping)) |
| `PATCH /teachers/{people_id}/confirm`, `/principals/{people_id}/confirm` | `development officer`, `development officer head`, `zonal deo`, `zonal deo head`, `zonal director`, `super admin` | Same zonal check for non-super-admins |
| `PATCH /teachers/{people_id}/promote` | same allow-list pattern as confirm | Same zonal check |
| `PATCH /teachers/{people_id}/reject` | same allow-list pattern | Same zonal check |
| `employer-appointment-reject-comments*` | same allow-list pattern | |

### Alerts — `AlertController`

| Route | Authorization |
|---|---|
| `GET /alerts/counts` | `super admin` only |
| `GET /alerts/pending-verification`, `/revised`, `/pending-confirmation`, `/rejected` | Any authenticated user, but results are scoped to the caller's zonal area if role is `development officer`/`zonal deo` and not also `super admin` |

### DEO Officers — `DeoOfficerController`

| Route | Authorization |
|---|---|
| `GET /deo-officers` (`index`) | Any authenticated user; `super admin` sees all, others see zonally-scoped results |
| `POST /deo-officers`, `PATCH /deo-officers/{id}`, `DELETE /deo-officers/{id}` | not gated by an explicit role allow-list at the top of the method (rely on caller being authenticated; verify before relying on this for sensitive writes) |

### User profile — `UserApiController` (`GET /api/user/{people_id}`)

- Viewing **your own** profile (`people_id` matches `jwt_people_id`): always allowed.
- Viewing **someone else's** profile: allowed only if your first Spatie role's
  `level` is strictly lower (more senior) than the target's first role's
  `level`. See [§3](#3-roles--the-roleslevel-hierarchy).

### User management — `UserManagementController`

All of `index`, `store`, `show`, `update`, `destroy`, `toggleStatus`,
`resetPassword` require `$request->user()?->hasRole('super admin')` (DB role
only — not JWT `roles` claim).

### Roles / permissions — `RoleController`

`GET/POST /roles`, `PUT /roles/{id}` require `auth:jwt` (grouped under the
`Route::middleware('auth:jwt')->group(...)` block in `routes/api.php`), but
have **no role-based authorization check inside the controller** — any
authenticated user can call these. `GET /permissions`, `GET
/permissions/{roleid}`, `DELETE /permissions/{roleid}` are **not even behind
`auth:jwt`** — they are fully public. See [§10](#10-known-gaps--observations).

---

## 6. Zonal Scoping

Defined in `app/Traits/ResolvesZonalScope.php`, used by controllers that need
to restrict a "DEO-level" user's view to their own zonal education office.

### `resolveUserZonalWorkplaceId(Request $request): ?string`

Finds the zonal education office (ZEO) workplace ID for the **authenticated
user's** current appointment workplace:

1. If the user's `currentAppointment->workplace_id` is itself a
   `ZonalEducationOffice`, return it directly.
2. Else, if it's a `DivisionalEducationOffice` (DEO), return that DEO's
   `zeo_wp_id` (its parent ZEO).
3. Else, if it's an `Institution`, return that institution's `zeo_wp_id`.
4. Else `null`.

### `applyTeacherZonalScope($query, string $zonalWorkplaceId)`

Adds a `whereHas('currentAppointment.workplace.institution', fn($q) =>
$q->where('zeo_wp_id', $zonalWorkplaceId))` constraint to a teacher/principal
query — i.e. restricts results to people whose institution belongs to the
given ZEO.

### `teacherBelongsToUserZonalArea()` (EmployerAppointmentConfirmationController)

A per-request variant used by `verify`/`confirm`/`promote`/`reject`: resolves
the **acting user's** zonal workplace ID, then checks whether the **target
teacher's** institution belongs to that same ZEO. Non-`super admin` actors
that fail this check get a 403 ("...can only verify/confirm teacher profiles
within their relevant zonal area").

---

## 7. Spatie Permissions: Status & Catalogue

The `spatie/laravel-permission` tables (`roles`, `permissions`,
`model_has_roles`, `model_has_permissions`, `role_has_permissions`) are still
present and seeded by `database/seeders/RolePermissionSeeder.php`, and
`User` still uses `HasRoles`. However:

- **No controller calls `hasPermissionTo()`, `can()`, or `Gate::`** for
  authorization decisions. `getAllPermissions()` is called once, in
  `UserApiController`, purely to **return** the list of permission names in
  the JSON response payload (for the frontend to use for UI gating) — it is
  not used to gate the backend response itself.
- The permission catalogue (dot-notation, e.g. `teacher.profile.view`,
  `menu.dashboard`, `alerts.profile.verify`) is largely a holdover from the
  old Livewire UI's permission-driven menu/Blade-directive system. Many
  permission strings reference UI concepts (`menu.*`, `dashboard.myprofile`)
  that don't map to current API behavior.
- Roles are still meaningfully used — but via **role name** (`hasAnyRole`,
  `hasRole`, `getRoleNames()`) and **`roles.level`**, not via permissions.

### Current role → permission assignments (from `RolePermissionSeeder`)

| Role | `level` | Permissions |
|---|---|---|
| `super admin`, `SSA`, `MOE Administrator` | 1, 1, 2 | All permissions (`Permission::all()`) |
| `Zonal Director`, `Zonal Deputy Director` | 3, 4 | "Approve/View" set: dashboard, schools (teachers/principals) view, teacher confirm/view/qualification/employment, principal view/qualification/employment, attendance manage, alerts view/verify/confirm, zonal menus |
| `Zonal Subject Head` | 5 | "Verify" set: dashboard, schools/teachers view, teacher view/qualification/employment, alerts view/verify |
| `Zonal DEO HEAD`, `Zonal DEO` | 6, 7 | Full CRUD set: teacher/principal create/update/delete/bulk-upload/promote/confirm, attendance, alerts (incl. revise/reject), zonal admin & DEO management |
| `teacher` | 7 | `menu.dashboard`, `dashboard.myprofile`, `my.profile.view` |
| `principal` | 8 | `menu.dashboard`, `dashboard.analytics`, schools/teachers menus, `teacher.profile.view`/`exportpdf`/`qualification.view`/`employment.view`, `institution.profile.view`/`report.module.pdf` |

If the frontend relies on the `permissions` array returned by
`GET /api/user/{people_id}` to show/hide UI, keep this table in sync with
`RolePermissionSeeder.php` when roles change.

---

## 8. `ViewRestrictPolicy` — Dead Code

`app/Policies/ViewRestrictPolicy.php` still exists and is still registered in
`app/Providers/AuthServiceProvider.php`:

```php
protected $policies = [
    People::class => ViewRestrictPolicy::class,
];
```

```php
public function viewRestrict(User $user, People $people): bool
{
    if (!$user->workplace) return false;
    $allowedWorkplaceIds = $user->workplace->getAllChildWorkplaces();
    return in_array($people->currentAppointment->workplace_id, $allowedWorkplaceIds);
}
```

However, **no controller in `app/Http/Controllers/API` calls
`$this->authorize('viewRestrict', ...)` or `Gate::allows('viewRestrict', ...)`**.
This was the primary authorization mechanism in the old Livewire profile
pages (50+ components called it), but those components no longer exist. The
policy registration is harmless dead configuration — workplace-hierarchy
scoping in the current API is instead done ad-hoc via
`ResolvesZonalScope` (see [§6](#6-zonal-scoping)), which is narrower in scope
(zonal-office level, not the full workplace tree).

---

## 9. Database Structure

### Spatie tables

**Migration:** `database/migrations/2025_08_24_025456_create_permission_tables.php`,
plus `database/migrations/2026_04_27_000001_add_level_to_roles_table.php`.

| Table | Key columns | Purpose |
|---|---|---|
| `permissions` | `id`, `name`, `guard_name` | Permission catalogue (largely unused for API authorization — see §7) |
| `roles` | `id`, `name`, `guard_name`, **`level`** (tinyint, nullable) | Role catalogue + hierarchy rank (lower = more senior) |
| `model_has_roles` | `role_id`, `model_type`, `model_id` | User ↔ Role assignment |
| `model_has_permissions` | `permission_id`, `model_type`, `model_id` | Direct user ↔ permission (unused in practice) |
| `role_has_permissions` | `permission_id`, `role_id` | Role ↔ Permission assignment |

### Cache configuration (`config/permission.php`)

| Setting | Value |
|---|---|
| Cache expiration | 24 hours |
| Cache store | `default` |
| Teams feature | Disabled |
| Wildcard permissions | Disabled |

`RolePermissionSeeder` clears the cache before seeding via
`app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions()`.

---

## 10. Known Gaps / Observations

1. **`/permissions` and `/permissions/{roleid}` (incl. `DELETE`) are not
   behind `auth:jwt`.** They're grouped outside the
   `Route::middleware('auth:jwt')->group(...)` block in `routes/api.php`.
   `RoleController::destroy` for permissions is reachable by anyone with
   network access. This should be reviewed — at minimum it should require
   `auth:jwt` + `super admin`, consistent with `/roles`/`/users`.

2. **`/roles` (`GET`/`POST`/`PUT`) require `auth:jwt` but no role check.**
   Any authenticated user (any role) can list, create, or edit roles via
   `RoleController`. Compare with `UserManagementController`, which
   explicitly checks `hasRole('super admin')` for equivalent user-management
   operations.

3. **Inconsistent role-resolution sources.** Most controllers use
   `resolvedRoles()` (JWT `roles` claim **+** DB Spatie roles, merged), but
   `UserManagementController::isSuperAdmin()` and `UserApiController`'s
   level check use **only** the local DB Spatie role
   (`$user->hasRole(...)` / `$user->roles()->first()`). If a user's role is
   granted via the WSO2 IS JWT claim but not yet synced to the local
   `model_has_roles` table, these two controllers will behave differently
   from the rest of the API for that user.

4. **`roles.level` is only used in one endpoint** (`UserApiController`) and
   only considers the user's *first* role (`roles()->first()`). A user with
   multiple roles has hierarchy decided by whichever role Spatie returns
   first (insertion order), which may not be the most senior one.

5. **`development officer` / `development officer head` role names are used
   in allow-lists but not present in `RolePermissionSeeder.php`'s current
   role list** (the seeder only creates `Zonal DEO` / `Zonal DEO HEAD`, etc.
   for the zonal hierarchy). These names likely originate from WSO2 IS JWT
   role claims for a different/older role naming scheme. Confirm whether
   these are still issued by IS, or whether the allow-lists can be
   simplified.

6. **`ViewRestrictPolicy` is dead code** (registered but never invoked) — see
   [§8](#8-viewrestrictpolicy--dead-code). Either remove the registration or
   wire it into the new controllers if workplace-tree-level (not just
   zonal-level) scoping is still needed somewhere.

7. **Spatie permission catalogue is largely vestigial** for the API (see
   §7) — it's seeded and returned to the frontend, but not enforced
   server-side. If the frontend uses these permission strings to gate UI,
   there's a risk of UI/backend authorization drift (UI hides a button based
   on a permission the backend doesn't actually check, or vice versa).

8. **`DeoOfficerController` write actions** (`store`/`update`/`destroy`) do
   not appear to have an explicit role allow-list at the point they execute
   — verify this is intentional (e.g. zonal-scoping alone is considered
   sufficient) or add a check consistent with the read-side scoping.

---

*End of RBAC Technical Documentation*
