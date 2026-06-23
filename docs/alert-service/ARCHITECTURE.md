# Alert Microservice — Architecture

**Branch:** `be/feat/alert-service`  
**Last updated:** 2026-06-19  
**Stack:** Node.js + Express + MySQL  
**Audience:** Backend developers, frontend developers, DevOps

---

## Table of Contents

1. [Why a Microservice](#1-why-a-microservice)
2. [System Context](#2-system-context)
3. [Service Responsibilities](#3-service-responsibilities)
4. [Two-Phase Design](#4-two-phase-design)
5. [High-Level Architecture](#5-high-level-architecture)
6. [Security Architecture](#6-security-architecture)
7. [Data Flow](#7-data-flow)
8. [Database Schema](#8-database-schema)
9. [Project Structure](#9-project-structure)
10. [Technology Choices](#10-technology-choices)
11. [Environment Configuration](#11-environment-configuration)
12. [Deployment](#12-deployment)

---

## 1. Why a Microservice

The alert service exists as a standalone service — not a module inside the Laravel backend, not a proxy wrapper — because **it owns its own database**. That is what makes it independently deployable and the common ground for all future services in the EMIS ecosystem.

Every future microservice in EMIS, regardless of language or framework, publishes alerts and notifications to this one service. A Python analytics service, a Go reporting service, a second Node service — they all speak to one place for alerts.

| Problem with the current setup | What the microservice solves |
|---------------------------------|------------------------------|
| Alert data lives in Laravel's DB, coupled to the HRM domain | Alert service owns its own DB — fully decoupled |
| Future services cannot publish alerts without touching Laravel | Any service can publish to the alert service's API |
| Frontend alert components call different sources inconsistently | One service, one contract, one URL |
| Cannot scale alert reads independently | Alert service scales on its own |
| No centralized auth or rate limiting for alert traffic | Every request passes through a hardened security stack |

---

## 2. System Context

```
┌──────────────────────────────────────────────────────────────────┐
│                      BROWSER (React SPA)                         │
│   Alert page → alertService.js → Alert Microservice URL         │
└─────────────────────────┬────────────────────────────────────────┘
                          │  HTTPS  Authorization: Bearer <token>
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│           Alert Microservice  (Node.js + Express)                │
│                                                                  │
│   TLS → Helmet → CORS → Rate Limit → JWT Validation →           │
│   Input Validation → Controller → Service                        │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Alert MySQL DB (own database)              │   │
│   │   alerts · alert_counts · service_keys                  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Phase 1: sync middleware reads from APIM/Laravel              │
└─────────────────────────┬────────────────────────────────────────┘
                          │  HTTPS  Authorization: Bearer <token>
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                  WSO2 API Manager (APIM)                         │
│   Validates token → strips /hrm/1.0.0 → forwards to Laravel     │
└─────────────────────────┬────────────────────────────────────────┘
                          │  HTTP
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│             Laravel Backend (FrankenPHP)                         │
│   JwtGuard validates token → returns alert data from its DB      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Service Responsibilities

**In scope:**

- Own and manage the alert MySQL database
- Expose a hardened HTTP API for reading alert data (counts + paginated lists)
- Validate every incoming JWT independently — not relying solely on APIM/Laravel
- Rate-limit all endpoints to protect upstream services and the DB
- Validate and sanitize all input before it touches the DB or upstream calls
- In Phase 1: populate the DB by reading from APIM/Laravel via an internal sync middleware
- Normalize all data into consistent camelCase shape before storing and serving
- Return consistent, information-safe error responses — no stack traces, no internal details

**Out of scope (Phase 1):**

- Accepting alert events published by producers (Phase 2)
- WebSocket / Server-Sent Events for real-time updates (future)
- Performing workflow actions (verify, confirm, reject) — direct frontend-to-APIM calls
- Email or SMS notifications (future)

---

## 4. Two-Phase Design

The service is designed so that the swap from Phase 1 to Phase 2 only replaces the data source layer. The DB schema, controllers, security stack, and the API the frontend calls are identical in both phases.

### Phase 1 — Alert service reads from APIM/Laravel (now)

```
Frontend  ──►  Alert Service  ──►  Alert DB (serve)
                    │
              sync middleware
                    │
                    ▼
              APIM / Laravel
```

When the frontend requests alert data, the sync middleware fetches from APIM/Laravel using the validated user JWT, writes/upserts into the alert DB, and the controller serves from the DB.

### Phase 2 — Producers publish to the alert service (future)

```
Frontend  ──►  Alert Service  ──►  Alert DB (serve)
                    ▲
         Laravel  ──┤  (service API key)
         Service X ─┤
         Service Y ─┘
```

Laravel and future services POST alert events using a service API key. The sync middleware is replaced by an event receiver endpoint. Everything else is unchanged.

**The DB schema is designed for Phase 2 from day one.**

---

## 5. High-Level Architecture

```
alert-service/
│
├── src/
│   ├── app.js                    Express app — registers all middleware and routes in order
│   ├── server.js                 HTTP server bootstrap
│   │
│   ├── config/
│   │   └── index.js              Reads and validates all env vars at startup — crashes if
│   │                             any required var is missing
│   │
│   ├── routes/
│   │   ├── alertRoutes.js        GET /api/alerts/* — user-facing routes
│   │   └── eventRoutes.js        POST /api/events/* — Phase 2 producer routes (stubbed)
│   │
│   ├── controllers/
│   │   └── alertController.js    Extract validated params → call service → send response
│   │
│   ├── services/
│   │   ├── alertService.js       Query the alert DB, return shaped data to controller
│   │   └── syncService.js        Phase 1: fetch from APIM/Laravel, upsert into alert DB
│   │
│   ├── db/
│   │   ├── connection.js         mysql2 connection pool
│   │   └── migrations/           SQL files — run automatically on startup
│   │       ├── 001_create_alerts.sql
│   │       ├── 002_create_alert_counts.sql
│   │       └── 003_create_service_keys.sql
│   │
│   └── middleware/
│       ├── helmet.js             Security headers — applied first, before everything else
│       ├── cors.js               CORS — locked to CORS_ORIGIN, explicit methods and headers
│       ├── rateLimiter.js        Rate limiting — global + per-route tiers
│       ├── auth.js               JWT validation — full signature + claims check, JWKS cached
│       ├── serviceAuth.js        Phase 2: API key validation for producer endpoints
│       ├── validate.js           Input validation and sanitization (express-validator)
│       ├── errorHandler.js       Catch all errors — safe response, full detail in logs only
│       └── requestLogger.js      Structured logging — never logs token or key values
│
├── .env.example
├── .env                          (gitignored)
├── package.json
├── Dockerfile
└── .dockerignore
```

### Middleware execution order

Every incoming request passes through this stack in order. A request that fails any layer is rejected immediately — it never reaches the next layer.

```
Request
   │
   ▼
1. Helmet          — set security headers on every response
   │
   ▼
2. CORS            — reject requests from unknown origins
   │
   ▼
3. Rate Limiter    — reject if request rate exceeds threshold
   │
   ▼
4. Auth / Service  — validate JWT (user routes) or API key (producer routes)
   │
   ▼
5. Input Validate  — reject malformed or out-of-range parameters
   │
   ▼
6. Controller      — business logic, calls service layer
   │
   ▼
7. Error Handler   — catch any thrown error, return safe response
```

---

## 6. Security Architecture

### 6.1 Transport Security

All traffic to the alert service in production goes over **HTTPS only**. TLS termination is handled at the infrastructure layer (nginx-proxy or load balancer), same as the existing EMIS stack. The Express app itself does not handle TLS — it runs HTTP behind the TLS terminator.

In local development, HTTP on `localhost` is acceptable.

---

### 6.2 Security Headers (Helmet)

`helmet` is applied as the **first middleware** — before CORS, before auth, before everything. It sets protective HTTP response headers on every response regardless of whether the request succeeds or fails.

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforce HTTPS for 1 year |
| `X-XSS-Protection` | `0` | Disable legacy XSS filter (CSP handles this) |
| `Content-Security-Policy` | `default-src 'none'` | Block all content embedding — API, not a page |
| `X-Powered-By` | *(removed)* | Do not expose the framework name |
| `Referrer-Policy` | `no-referrer` | Do not leak URL in Referer header |

---

### 6.3 CORS

CORS is applied after Helmet and before rate limiting. The policy is strict — only the specific frontend origin is allowed. No wildcard.

| Setting | Value |
|---------|-------|
| `origin` | `CORS_ORIGIN` env var only (e.g. `https://app-uat.emis.moe.gov.lk`) |
| `methods` | `GET, OPTIONS` (user routes) — no POST, PUT, DELETE from browser |
| `allowedHeaders` | `Authorization, Content-Type` only |
| `credentials` | `true` |
| `optionsSuccessStatus` | `204` |

Preflight `OPTIONS` requests are handled automatically and do not reach the auth middleware.

---

### 6.4 Rate Limiting

Three tiers of rate limiting using `express-rate-limit`. Limits are per IP address.

| Tier | Applied to | Window | Max requests | Response on breach |
|------|-----------|--------|-------------|-------------------|
| **Global** | All routes | 15 min | 500 | `429 TOO_MANY_REQUESTS` |
| **Alert reads** | `GET /api/alerts/*` | 1 min | 60 | `429 TOO_MANY_REQUESTS` |
| **Health check** | `GET /health` | 1 min | 120 | `429 TOO_MANY_REQUESTS` |

Rate limit headers are included in every response so clients can self-throttle:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1750000000
```

---

### 6.5 JWT Validation (User Auth)

This is the most important security change from the original design. **The alert service validates JWTs itself** — it does not rely solely on APIM/Laravel to be the gatekeeper.

**Why:** In the original design, the `auth` middleware only checked that a Bearer header existed. A request with a fake, expired, or malformed token would pass the middleware, trigger a sync call to APIM, and only then get rejected. This means the service blindly forwards every request to APIM, giving bad actors a free route to hammer the upstream.

**The fix — defense in depth:**

```
Token is validated at THREE points:
  1. Alert Service      ← NEW — signature + claims verified before anything else happens
  2. APIM              ← existing — full OAuth validation
  3. Laravel backend   ← existing — JwtGuard JWKS validation
```

**How the alert service validates the JWT:**

The `auth` middleware:

1. Extracts the Bearer token from the `Authorization` header. Missing or malformed → `401` immediately.
2. Fetches the JWKS from `WSO2_JWKS_URI` (cached in-memory for `JWKS_CACHE_TTL` seconds — default 3600, same as Laravel).
3. Verifies the token signature using the matching public key from the JWKS.
4. Verifies the following claims:
   - `exp` — token is not expired
   - `iss` — issuer matches `WSO2_ISSUER` env var
   - `aud` — audience matches `WSO2_AUDIENCE` env var (if present)
5. If any check fails → `401` immediately. No sync call is made. No DB is touched.
6. If all checks pass → attach the decoded payload to `req.jwtPayload` and continue.

**JWKS caching:**

```
First request:
  fetch JWKS from WSO2_JWKS_URI → cache in memory with TTL

Subsequent requests within TTL:
  read from in-memory cache → no network call

On cache miss or key rotation:
  re-fetch from WSO2_JWKS_URI → update cache
```

The cache TTL is configurable via `JWKS_CACHE_TTL` env var. Default: `3600` seconds (1 hour), matching Laravel's behavior.

**Libraries used:** `jsonwebtoken` for verification, `jwks-rsa` for JWKS fetching and key rotation handling.

---

### 6.6 Service-to-Service Auth (Phase 2)

When producers (Laravel, future services) publish alert events, they use a dedicated **API key** — not a user JWT. User JWTs are issued per user and expire in 1 hour. Service keys are long-lived and issued per service.

**Header for producer requests:**

```
X-Service-Key: <api-key>
```

**How service keys are stored and verified:**

- API keys are generated as cryptographically random 64-character hex strings
- Keys are stored in the `service_keys` DB table as **SHA-256 hashes** — the plain text key is never stored
- On each producer request, the incoming key is hashed and compared against the stored hash
- A compromised key can be revoked by deleting or deactivating its row in the DB

**`service_keys` table:**

```sql
CREATE TABLE service_keys (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  service_name VARCHAR(64)   NOT NULL,
  key_hash     CHAR(64)      NOT NULL,
  active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP         NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_key_hash (key_hash),
  INDEX idx_active (active)
);
```

The `serviceAuth` middleware handles this — it is applied **only** to producer routes (`POST /api/events/*`). User-facing read routes never see this middleware.

---

### 6.7 Input Validation

All query parameters are validated and sanitized using `express-validator` before reaching the controller. A request with invalid parameters is rejected with `400 BAD_REQUEST` — it never touches the DB or the sync service.

**Rules for list endpoints:**

| Parameter | Rule | On failure |
|-----------|------|-----------|
| `page` | Integer, min 1, max 10000 | `400 BAD_REQUEST` |
| `per_page` | Integer, min 1, max 100 | `400 BAD_REQUEST` |

Any extra query parameters not in the allowed list are stripped silently.

---

### 6.8 Database Security

**Restricted DB user:**

The `DB_USER` in the environment must be a MySQL user with the minimum necessary privileges:

```sql
GRANT SELECT, INSERT, UPDATE ON emis_alerts.* TO 'alert_service'@'%';
-- No DROP, no CREATE, no DELETE, no GRANT
```

Migrations are run by a separate `DB_MIGRATE_USER` with broader privileges, only at startup, and never during normal request handling.

**Parameterized queries only:**

All DB queries use `mysql2`'s parameterized query syntax. String concatenation into SQL is never used anywhere in the service. This fully prevents SQL injection.

```js
// Correct — always
connection.query('SELECT * FROM alerts WHERE alert_type = ? AND status = ?', [type, 'active'])

// Never allowed
connection.query(`SELECT * FROM alerts WHERE alert_type = '${type}'`)
```

**Sensitive data in payload:**

The `payload` JSON column stores teacher display data (names, school, appointment dates). It does not store NIC numbers, addresses, or any personally sensitive fields beyond what is already shown on the Alert page.

---

### 6.9 Error Handling — No Information Leakage

The `errorHandler` middleware is the **last middleware** registered. It catches every unhandled error thrown anywhere in the service.

**Rules:**

1. In `production`, all errors return a generic message to the client — no stack traces, no internal details, no DB query text.
2. Full error detail (message + stack trace + request ID) is written to the server log only.
3. `502` and `503` errors from upstream (APIM/Laravel) are translated — the client sees `UPSTREAM_ERROR`, not the raw APIM error body.
4. The error response never includes the values of request headers or query parameters.

**Response shape — always consistent:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token validation failed."
  }
}
```

---

### 6.10 Request Logging — No Secrets in Logs

The `requestLogger` middleware logs every request with:
- Request ID (UUID generated per request)
- HTTP method and path
- Response status code
- Response time in ms
- Client IP

It **never** logs:
- The value of the `Authorization` header
- The value of the `X-Service-Key` header
- Any part of the JWT payload
- Request or response body content

---

### 6.11 Dependency Security

- `package-lock.json` is committed and used in CI/CD — exact versions are pinned
- `npm audit` runs in the CI/CD pipeline on every push — build fails on high-severity vulnerabilities
- Dependencies are reviewed for known CVEs before adding any new package

---

### 6.12 Container Security

The Dockerfile is hardened:

- Runs as a **non-root user** (`node` user, UID 1000) — never as root
- Uses a **multi-stage build** — only production dependencies in the final image, no dev tools, no build artifacts
- Uses the official `node:20-alpine` base image — minimal attack surface
- `.dockerignore` excludes `.env`, `node_modules`, test files, and documentation

---

## 7. Data Flow

### Counts request (Primary tab)

```
1.  React Alert.jsx mounts
2.  alertService.getAlertCounts() [frontend/src/api/alertService.js]
3.  GET https://alert-service/api/alerts/counts
    Authorization: Bearer <asgardeo-token>
4.  Helmet: security headers applied to response
5.  CORS: origin allowed? → yes
6.  Rate limiter: within limit? → yes
7.  auth middleware:
      a. Extract Bearer token
      b. Fetch JWKS from WSO2_JWKS_URI (from cache)
      c. Verify signature, exp, iss, aud → valid
      d. Attach decoded payload to req.jwtPayload
8.  Input validation: no params on this endpoint → pass
9.  alertController.getCounts()
10. syncService.syncCounts(bearerToken):
      a. GET APIM_BASE_URL/alerts/counts + Bearer token
      b. APIM validates token → Laravel JwtGuard validates → returns counts
      c. Upsert into alert_counts table
11. alertService.getCounts(): SELECT from alert_counts table
12. Return normalized { pendingVerification, revised, pendingConfirmation, rejected }
13. Controller sends 200
14. React renders count cards
```

### List request (any tab)

```
1.  User clicks Verification tab
2.  PendingVerificationList calls alertService.getPendingVerification({ page: 1, perPage: 20 })
3.  GET https://alert-service/api/alerts/pending-verification?page=1&per_page=20
    Authorization: Bearer <token>
4.  Helmet → CORS → Rate limiter → JWT validation (all pass)
5.  Input validation:
      page=1 → integer, min 1 → pass
      per_page=20 → integer, min 1, max 100 → pass
6.  alertController.getList(type="pending-verification", page=1, perPage=20)
7.  syncService.syncList(type, bearerToken, page, perPage):
      a. GET APIM_BASE_URL/alerts/pending-verification?page=1&per_page=20 + Bearer
      b. APIM → Laravel → paginated teacher list returned
      c. Normalize snake_case → camelCase
      d. Upsert records into alerts table (type="pending_verification")
8.  alertService.getList(type, page, perPage):
      SELECT from alerts WHERE alert_type=? AND status='active'
      LIMIT ? OFFSET ?   (parameterized)
9.  Return { items: [...], pagination: { currentPage, lastPage, perPage, total } }
10. Controller sends 200
11. PendingVerificationList sets state, passes data as props to AlertTeacherList
```

---

## 8. Database Schema

### `alerts` table

```sql
CREATE TABLE alerts (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  alert_type      VARCHAR(64)     NOT NULL,
  producer        VARCHAR(64)     NOT NULL DEFAULT 'emis-hrm',
  people_id       VARCHAR(32)     NOT NULL,
  recipient_role  VARCHAR(64)         NULL,
  status          ENUM('active','resolved','archived')
                                  NOT NULL DEFAULT 'active',
  payload         JSON            NOT NULL,
  external_ref    VARCHAR(128)        NULL,
  synced_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_external_ref (alert_type, external_ref),
  INDEX idx_alert_type  (alert_type),
  INDEX idx_people_id   (people_id),
  INDEX idx_status      (status),
  INDEX idx_synced_at   (synced_at)
);
```

| Column | Description |
|--------|-------------|
| `alert_type` | `pending_verification`, `revised`, `pending_confirmation`, `rejected` |
| `producer` | Which system created this alert. Phase 1: `emis-hrm` |
| `people_id` | Teacher or principal this alert relates to |
| `recipient_role` | Which role should see this alert. NULL = all authorized roles |
| `status` | `active` = needs attention. `resolved` = actioned. `archived` = hidden |
| `payload` | JSON — all display data. No lookups needed to render an alert |
| `external_ref` | ID in the producer's system — used for upsert deduplication |
| `synced_at` | Last refreshed from upstream (Phase 1) |

**`payload` structure:**

```json
{
  "fullName": "Kamal Perera",
  "nameWithInitials": "K. Perera",
  "appointmentDate": "2024-03-15",
  "school": {
    "name": "Ananda College",
    "censusNo": "AC001"
  },
  "rejection": {
    "reason": "Incomplete documentation",
    "rejectedAt": "2024-01-15"
  }
}
```

`rejection` key is present only for `alert_type = 'rejected'`.

---

### `alert_counts` table

```sql
CREATE TABLE alert_counts (
  alert_type    VARCHAR(64)   NOT NULL,
  count         INT UNSIGNED  NOT NULL DEFAULT 0,
  refreshed_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (alert_type)
);
```

---

### `service_keys` table

```sql
CREATE TABLE service_keys (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  service_name VARCHAR(64)   NOT NULL,
  key_hash     CHAR(64)      NOT NULL,
  active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP         NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_key_hash (key_hash),
  INDEX idx_active (active)
);
```

---

## 9. Project Structure

```
emis/
├── backend/          Laravel + FrankenPHP (existing)
├── frontend/         React + Vite (existing)
├── alert-service/    Node.js + Express + MySQL (NEW)
├── infrastructure/
└── docs/
```

---

## 10. Technology Choices

| Concern | Choice | Reason |
|---------|--------|--------|
| Runtime | Node.js 20 LTS | Lightweight, fast I/O, non-blocking |
| Framework | Express 4 | Minimal, no magic, well-understood |
| Database | MySQL 8 | Same engine as rest of EMIS; ops team is familiar |
| DB driver | `mysql2` | Promise-based, parameterized queries, fast |
| HTTP client | `axios` | Same library used in frontend; consistent error handling |
| JWT validation | `jsonwebtoken` + `jwks-rsa` | Industry standard; same approach as Laravel's `firebase/php-jwt` |
| Security headers | `helmet` | One dependency, covers all OWASP header recommendations |
| Rate limiting | `express-rate-limit` | Lightweight, no Redis dependency needed in Phase 1 |
| Input validation | `express-validator` | Declarative, well-maintained, integrates with Express naturally |
| Environment | `dotenv` | Standard; `.env.example` pattern already used across this repo |
| Logging | `morgan` + structured `console` | No external log service dependency in Phase 1 |
| Containerisation | Docker (multi-stage, non-root) | Consistent with how `backend/` and `frontend/` are run |

---

## 11. Environment Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default: `3001`) | Port the Express server listens on |
| `NODE_ENV` | No (default: `development`) | `development` or `production` — controls error detail in responses |
| `APIM_BASE_URL` | Yes | APIM gateway base URL e.g. `https://services.app-uat.emis.moe.gov.lk/hrm/1.0.0` |
| `CORS_ORIGIN` | Yes | Exact frontend origin e.g. `https://app-uat.emis.moe.gov.lk` |
| `WSO2_JWKS_URI` | Yes | JWKS endpoint e.g. `https://<asgardeo-base>/oauth2/jwks` |
| `WSO2_ISSUER` | Yes | Expected `iss` claim e.g. `https://api.asgardeo.io/t/<org>/oauth2/token` |
| `WSO2_AUDIENCE` | No | Expected `aud` claim — if set, tokens without this audience are rejected |
| `JWKS_CACHE_TTL` | No (default: `3600`) | Seconds to cache JWKS public keys in memory |
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | No (default: `3306`) | MySQL port |
| `DB_NAME` | Yes | Alert service database name e.g. `emis_alerts` |
| `DB_USER` | Yes | Restricted MySQL user — SELECT, INSERT, UPDATE only |
| `DB_PASSWORD` | Yes | MySQL password |
| `DB_MIGRATE_USER` | Yes | Migration MySQL user — broader privileges, used only at startup |
| `DB_MIGRATE_PASSWORD` | Yes | Migration user password |

---

## 12. Deployment

### Local development

```bash
cd alert-service
cp .env.example .env
# fill in all required values
npm install
npm run dev        # nodemon — restarts on file changes
```

Service available at `http://localhost:3001`.  
Requires a local MySQL instance with the `emis_alerts` database. Migrations run automatically on startup using `DB_MIGRATE_USER`.

### Docker (local stack)

Added to `infrastructure/docker-swarm/docker-compose.local.yml`:
- `alert-service` container (Node.js app)
- `alert-mysql` container (dedicated MySQL 8 instance)

Both join the existing Docker overlay network.

### Production

Added to `infrastructure/docker-swarm/docker-stack.yml`. The production MySQL for the alert service is a **separate instance** from the main EMIS MySQL — enforces DB-level isolation. The `alert-service` container runs as UID 1000 (non-root).

### Security checklist before production deploy

- [ ] `NODE_ENV=production` is set
- [ ] `DB_USER` is a restricted MySQL user (no DROP, no GRANT)
- [ ] `CORS_ORIGIN` is the exact production frontend URL — no wildcard
- [ ] `WSO2_JWKS_URI`, `WSO2_ISSUER` point to the production IS instance
- [ ] TLS termination is in place at the nginx-proxy or load balancer layer
- [ ] `npm audit` returns no high or critical vulnerabilities
- [ ] Docker image built with the multi-stage Dockerfile (not dev mode)
- [ ] `.env` file is not committed and not baked into the Docker image
