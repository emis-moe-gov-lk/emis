# EMIS Login & Authentication Flow

**Branch:** `docs/feat/login-flow`  
**Last updated:** 2026-06-17  
**Audience:** Frontend developers, backend developers, integration engineers

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Login Flow — Step by Step](#3-login-flow--step-by-step)
4. [PKCE Authorization Code Flow (Detail)](#4-pkce-authorization-code-flow-detail)
5. [Token Lifecycle & Axios Integration](#5-token-lifecycle--axios-integration)
6. [Backend JWT Validation](#6-backend-jwt-validation)
7. [Identity Bootstrap](#7-identity-bootstrap)
8. [Logout Flow](#8-logout-flow)
9. [Error Scenarios](#9-error-scenarios)
10. [Configuration Reference](#10-configuration-reference)

---

## 1. Architecture Overview

The EMIS authentication system is built on three separate layers. Each layer has a distinct responsibility and no layer bypasses the others.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (React SPA)                     │
│                                                                 │
│   Asgardeo SDK  →  axios interceptor  →  sessionStorage tokens  │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS  Authorization: Bearer <token>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WSO2 API Manager (APIM)                      │
│                                                                 │
│   Validates token  →  strips /hrm/1.0.0  →  forwards to backend│
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP  Authorization: Bearer <token>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Laravel Backend (FrankenPHP)                   │
│                                                                 │
│   JwtGuard  →  JWKS fetch  →  decode JWT  →  resolve User model│
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               WSO2 Identity Server (IS / Asgardeo)              │
│                                                                 │
│   Issues tokens  →  serves JWKS  →  handles login UI           │
└─────────────────────────────────────────────────────────────────┘
```

**Key principle:** The user never enters credentials into the EMIS application itself. Login happens entirely on the WSO2 IS / Asgardeo login page. EMIS only handles the token it receives back.

---

## 2. Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Identity Provider | WSO2 Identity Server (Asgardeo) | Issues JWT access tokens, manages user credentials |
| Frontend SDK | `@asgardeo/auth-react` | Handles PKCE flow, token storage, token refresh |
| API Gateway | WSO2 API Manager | First-hop token validation, context-path routing |
| Backend auth | Laravel `JwtGuard` (custom) | Per-request JWT re-validation, user resolution |
| JWT library | `firebase/php-jwt` | JWKS parsing and JWT decode on the backend |
| Token storage | Browser `sessionStorage` | Access token, refresh token, ID token |
| Identity cache | Browser `localStorage` | `peopleId`, email, name, roles (derived from `/identity`) |

---

## 3. Login Flow — Step by Step

```
User                   Browser (React)         Asgardeo IS              APIM         Laravel
 │                          │                      │                      │              │
 │  Open EMIS app           │                      │                      │              │
 │─────────────────────────►│                      │                      │              │
 │                          │  Check auth state     │                      │              │
 │                          │  (not authenticated)  │                      │              │
 │                          │                      │                      │              │
 │                          │  Redirect to IS login │                      │              │
 │                          │─────────────────────►│                      │              │
 │                          │                      │                      │              │
 │  Enter username/password │                      │                      │              │
 │─────────────────────────────────────────────────►                      │              │
 │                          │                      │                      │              │
 │                          │  Auth code + state    │                      │              │
 │                          │◄─────────────────────│                      │              │
 │                          │                      │                      │              │
 │                          │  Exchange code for tokens (PKCE)            │              │
 │                          │─────────────────────►│                      │              │
 │                          │                      │                      │              │
 │                          │  access_token         │                      │              │
 │                          │  id_token             │                      │              │
 │                          │  refresh_token        │                      │              │
 │                          │◄─────────────────────│                      │              │
 │                          │                      │                      │              │
 │                          │  Store in sessionStorage                    │              │
 │                          │                      │                      │              │
 │                          │  GET /identity (Bearer access_token)        │              │
 │                          │─────────────────────────────────────────────►             │
 │                          │                      │                      │  Forward ──► │
 │                          │                      │                      │              │
 │                          │                      │                      │ JwtGuard     │
 │                          │                      │                      │ validates    │
 │                          │                      │                      │ JWT via JWKS │
 │                          │                      │                      │              │
 │                          │  identity payload (roles, permissions, workplace)          │
 │                          │◄────────────────────────────────────────────────────────── │
 │                          │                      │                      │              │
 │                          │  Persist identity to localStorage           │              │
 │                          │                      │                      │              │
 │  EMIS app loads          │                      │                      │              │
 │◄─────────────────────────│                      │                      │              │
```

---

## 4. PKCE Authorization Code Flow (Detail)

EMIS uses **Authorization Code Flow with PKCE** (Proof Key for Code Exchange). This is the secure variant designed for SPAs — it prevents authorization code interception attacks.

### What PKCE adds

Before redirecting to IS, the Asgardeo SDK:
1. Generates a random `code_verifier` string
2. Hashes it to produce a `code_challenge`
3. Sends `code_challenge` + `code_challenge_method=S256` in the authorization request

When exchanging the code for tokens, the SDK sends the original `code_verifier`. The IS server hashes it and checks it matches the `code_challenge` from step 1. This means a stolen authorization code is useless without the verifier.

### Authorization request (redirect to IS)

```
GET https://<asgardeo-base-url>/oauth2/authorize
  ?response_type=code
  &client_id=<VITE_ASGARDEO_CLIENT_ID>
  &redirect_uri=<VITE_SIGNIN_REDIRECT_URL>
  &scope=openid profile email roles phone
  &state=<random>
  &code_challenge=<S256 hash>
  &code_challenge_method=S256
```

**Scopes requested:**

| Scope | What it unlocks |
|-------|----------------|
| `openid` | Required for OIDC — enables the ID token |
| `profile` | `name`, `preferred_username` claims |
| `email` | `email` claim — used to match the local User record |
| `roles` | Role assignments from WSO2 IS |
| `phone` | Phone number claim |

### Token exchange (handled by SDK)

After IS redirects back with `?code=...&state=...`, the SDK POST-exchanges it:

```
POST https://<asgardeo-base-url>/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=<authorization_code>
&redirect_uri=<VITE_SIGNIN_REDIRECT_URL>
&client_id=<VITE_ASGARDEO_CLIENT_ID>
&code_verifier=<original_verifier>
```

**Token response:**

```json
{
  "access_token": "eyJ...",
  "id_token": "eyJ...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "openid profile email roles phone"
}
```

All three tokens are stored in `sessionStorage` by the Asgardeo SDK. They are cleared when the browser tab or window is closed.

---

## 5. Token Lifecycle & Axios Integration

### How every API call gets a token

Every axios request goes through a request interceptor defined in [frontend/src/api/axios.jsx](../../frontend/src/api/axios.jsx):

```js
api.interceptors.request.use(async (config) => {
  const authClient = AsgardeoSPAClient.getInstance();
  const accessToken = await authClient.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
```

`getAccessToken()` is not just a read — the Asgardeo SDK automatically refreshes the access token using the refresh token if it is expired. The developer does not need to manage token refresh manually.

### Token storage locations

| Token | Stored in | Lifetime |
|-------|-----------|---------|
| `access_token` | `sessionStorage` | 1 hour (default IS config) |
| `refresh_token` | `sessionStorage` | Longer-lived; used to get new access tokens |
| `id_token` | `sessionStorage` | Session duration |
| Identity data (roles, people_id, etc.) | `localStorage` | Persists across page reloads until logout |

### 401 response handling

The response interceptor logs `401` errors but does not currently force a re-login automatically:

```js
if (error.response?.status === 401) {
  console.error("Unauthorized request - token may be expired");
}
```

A 401 from the backend means either the token expired and the SDK failed to refresh it, or the user account was deactivated.

---

## 6. Backend JWT Validation

Every protected API request hits the `JwtGuard` in [backend/app/Auth/JwtGuard.php](../../backend/app/Auth/JwtGuard.php). This runs on every single request — there are no session cookies involved.

### Validation steps

```
Incoming request
       │
       ▼
1. Extract Bearer token from Authorization header
       │
       ▼
2. Fetch JWKS from WSO2 IS
   URL: WSO2_BASE_URL + /oauth2/jwks
   Cached in Laravel Cache for 1 hour
       │
       ▼
3. Decode & verify JWT signature
   Library: firebase/php-jwt
   Leeway: 60 seconds (clock skew tolerance)
       │
       ▼
4. Extract identity claim from JWT payload
   Tries in order: email → preferred_username → upn → username
       │
       ▼
5. Look up User in local database
   SELECT * FROM users WHERE LOWER(email) = LOWER(<claim>)
       │
       ▼
6. Set request attributes:
   jwt_email      → used by /identity
   jwt_roles      → roles array from JWT
   jwt_people_id  → people_id from local User record
       │
       ▼
7. Return User model → request is authenticated
```

### JWKS caching

The backend fetches the public keys from IS once and caches them for **1 hour**:

```php
$jwks = Cache::remember('jwks_keyset', 3600, function () {
    $client = new Client(['verify' => config('auth.wso2_verify_ssl')]);
    $response = $client->get(config('auth.jwks_uri'));
    return json_decode((string) $response->getBody(), true);
});
```

**JWKS endpoint:** `WSO2_BASE_URL/oauth2/jwks`

If IS rotates its signing keys, the old JWKS will be used for up to 1 hour before the cache expires. During a key rotation event, clear the Laravel cache to force an immediate refresh.

### JWT payload claims used by the backend

| Claim | Used for |
|-------|---------|
| `email` | Primary claim for user lookup |
| `preferred_username` | Fallback if `email` is absent |
| `upn` | Fallback (User Principal Name, common in AD-federated setups) |
| `username` | Final fallback |
| `roles` | Stored on request attributes as `jwt_roles` |

---

## 7. Identity Bootstrap

After a successful login, the frontend immediately calls `GET /identity` to load the full user context. This is handled by [frontend/src/context/AuthUserContext.jsx](../../frontend/src/context/AuthUserContext.jsx).

### When it runs

The `AuthUserProvider` watches `state.isAuthenticated` from the Asgardeo SDK. As soon as it becomes `true`, `hydrateIdentity()` fires automatically.

### What `/identity` returns

```json
{
  "status": "success",
  "data": {
    "token": {
      "email": "user@example.com"
    },
    "user": {
      "id": 42,
      "people_id": "P001234",
      "name": "Kamal Perera",
      "email": "user@example.com",
      "contact": "0771234567",
      "gender": "Male",
      "active_status": true,
      "profile_picture": null,
      "must_change_password": false,
      "password_changed_at": "2025-01-15T08:00:00Z",
      "identity_provider": "asgardeo"
    },
    "people_id": "P001234",
    "roles": ["Teacher", "ZEO Admin"],
    "permissions": ["view-teachers", "edit-institutions"],
    "primary_role": "Teacher",
    "office_level": "Zonal Education Office",
    "office_level_id": 3,
    "must_change_password": false,
    "password_change_required_reason": null,
    "identity_provider": "asgardeo",
    "workplace": {
      "workplace_id": "WP0021",
      "office_level_id": 3,
      "office_level_name": "Zonal Education Office",
      "name": "Colombo ZEO",
      "address": "123 Main Street, Colombo",
      "office": {
        "id": 5,
        "name": "Colombo Zonal Office",
        "short_name": "CMB-ZEO",
        "workplace_id": "WP0021"
      },
      "zonal_education_office": {
        "id": 5,
        "name": "Colombo Zonal Education Office",
        "short_name": "CMB-ZEO",
        "workplace_id": "WP0021",
        "province_name": "Western"
      }
    }
  }
}
```

### What gets persisted to localStorage

| Key | Value |
|-----|-------|
| `peopleId` | The user's `people_id` (e.g. `P001234`) |
| `email` | User email |
| `name` | Display name |
| `username` | Same as name |
| `gender` | Gender from people record |
| `roles` | JSON array of role names |
| `identityData` | Full raw identity JSON |

### Context values available to the app

After hydration, every component that uses `useAuthUser()` gets:

| Value | Type | Description |
|-------|------|-------------|
| `isAuthenticated` | boolean | From Asgardeo SDK |
| `isLoading` | boolean | True while hydrating identity |
| `user` | object | User record fields |
| `roles` | string[] | Role names (lowercased for comparison) |
| `permissions` | string[] | Spatie permission names |
| `primaryRole` | string | First role in the roles array |
| `peopleId` | string | `people_id` for API calls |
| `workplace` | object | Current workplace with office hierarchy |
| `officeLevel` | string | e.g. `"Zonal Education Office"` |
| `mustChangePassword` | boolean | Prompts password change UI if true |
| `hasRole(name)` | function | Case-insensitive role check |
| `hasPermission(name)` | function | Exact permission name check |
| `hasAnyPermission(names[])` | function | True if any permission matches |

---

## 8. Logout Flow

```
User clicks Logout
        │
        ▼
1. AuthUserContext.clearIdentity()
   - Removes all localStorage keys
   - Clears identity state
        │
        ▼
2. Asgardeo SDK signOut()
   - Clears sessionStorage (access_token, refresh_token, id_token)
   - Redirects browser to IS end-session endpoint:
        │
        ▼
3. IS End Session
   GET https://<asgardeo-base-url>/oidc/logout
     ?id_token_hint=<id_token>
     &post_logout_redirect_uri=<VITE_SIGNOUT_REDIRECT_URL>
        │
        ▼
4. IS invalidates the session server-side
        │
        ▼
5. Browser is redirected to VITE_SIGNOUT_REDIRECT_URL
   (typically the EMIS home/login page)
```

After logout, the access token may still be technically valid until it expires (JWTs are stateless). The backend does not maintain a token blocklist. The effective logout happens because:
- The token is removed from `sessionStorage` — the frontend cannot attach it to requests
- IS invalidates the SSO session — the user would need to re-enter credentials to get a new token

---

## 9. Error Scenarios

### User not in local database

**Scenario:** A valid WSO2 IS account exists but no matching row is in the EMIS `users` table.

**What happens:**
- `JwtGuard` successfully decodes the JWT
- `User::query()->whereRaw('LOWER(email) = ?', [$email])->first()` returns `null`
- Guard returns `null` → request is treated as unauthenticated
- Protected routes return `401 Unauthorized`
- A warning is written to the Laravel log: `JWT user resolution failed: no matching local user`

**Resolution:** An EMIS administrator must create the user account in the system (`POST /users`) before that person can use protected endpoints.

---

### User account is inactive

**Scenario:** The user exists in the database but `active_status = false`.

**What happens:**
- `JwtGuard` resolves the User model (active status is not checked in the guard itself)
- The `POST /login` legacy endpoint explicitly checks `$user->active_status` and returns `401`
- Depending on which path is hit, the user may get a 401 or a 403

**Resolution:** An administrator must re-activate the account via `PATCH /users/{id}/toggle-status`.

---

### Expired access token

**Scenario:** The access token has expired and the SDK's silent refresh also fails (e.g. refresh token expired or network issue).

**What happens:**
- `getAccessToken()` in the axios interceptor returns `null` or throws
- The request goes out without an `Authorization` header
- The backend returns `401 Unauthorized`
- The response interceptor logs the error but does not force re-login

**Resolution:** The user must reload the page. The Asgardeo SDK will detect the unauthenticated state and redirect to the IS login page.

---

### JWKS cache stale after key rotation

**Scenario:** WSO2 IS rotates its signing keys. Tokens signed with the new key fail to verify against the cached old JWKS.

**What happens:**
- `JWT::decode()` throws an exception
- `JwtGuard` logs: `JWT decode failed`
- All protected requests return `401` for up to 1 hour

**Resolution:** Clear the Laravel cache:
```bash
php artisan cache:clear
```
Or flush only the JWKS key:
```bash
php artisan tinker --execute="Cache::forget('jwks_keyset');"
```

---

### `must_change_password` flag is set

**Scenario:** An administrator reset the user's password or the account was newly created with a default password.

**What happens:**
- `/identity` returns `"must_change_password": true`
- `AuthUserContext` exposes `mustChangePassword: true`
- The frontend renders a password change modal/page before allowing normal navigation

**Resolution:** The user completes the password change flow. On completion, the frontend calls `PATCH /profile/password`, which clears the flag. If the password was changed externally (e.g. through IS admin UI), the frontend calls `POST /profile/password/complete-external` instead.

---

## 10. Configuration Reference

### Frontend environment variables (`.env` / `frontend.env`)

| Variable | Description |
|----------|-------------|
| `VITE_ASGARDEO_CLIENT_ID` | OAuth client ID registered in WSO2 IS / Asgardeo |
| `VITE_ASGARDEO_BASE_URL` | Base URL of the IS instance (e.g. `https://api.asgardeo.io/t/<org>`) |
| `VITE_SIGNIN_REDIRECT_URL` | URL IS redirects back to after login (must match IS app config) |
| `VITE_SIGNOUT_REDIRECT_URL` | URL IS redirects to after logout |
| `VITE_API_BASE_URL` | APIM gateway URL (e.g. `https://services.app-uat.emis.moe.gov.lk/hrm/1.0.0`) |

> **Note:** `VITE_*` variables are baked into the frontend bundle at build time. Changing them requires a rebuild — restarting the container alone has no effect.

### Backend environment variables (`backend.env`)

| Variable | Description |
|----------|-------------|
| `WSO2_BASE_URL` | Base URL of WSO2 IS (JWKS URI is derived as `WSO2_BASE_URL/oauth2/jwks`) |
| `WSO2_VERIFY_SSL` | `true`/`false` — whether to verify IS's TLS certificate (always `true` in production) |
| `AUTH_GUARD` | Defaults to `jwt` — the custom `JwtGuard` driver |

### Key source files

| File | Purpose |
|------|---------|
| [frontend/src/authConfig.js](../../frontend/src/authConfig.js) | Asgardeo SDK configuration (client ID, base URL, scopes, PKCE) |
| [frontend/src/api/axios.jsx](../../frontend/src/api/axios.jsx) | Axios instance with token interceptor |
| [frontend/src/context/AuthUserContext.jsx](../../frontend/src/context/AuthUserContext.jsx) | Identity hydration, localStorage persistence, context values |
| [frontend/src/api/auth.jsx](../../frontend/src/api/auth.jsx) | `getIdentity()`, `changeOwnPassword()`, `completeExternalPasswordChange()` |
| [backend/app/Auth/JwtGuard.php](../../backend/app/Auth/JwtGuard.php) | Custom Laravel auth guard — JWT decode + user resolution |
| [backend/app/Http/Controllers/API/AuthIdentityController.php](../../backend/app/Http/Controllers/API/AuthIdentityController.php) | `GET /identity` — builds the full identity payload |
| [backend/app/Services/OIDCProvider.php](../../backend/app/Services/OIDCProvider.php) | Laravel Socialite OIDC provider (server-side OIDC, not the primary flow) |
| [backend/config/auth.php](../../backend/config/auth.php) | Guard registration, JWKS URI, SSL verification flag |
