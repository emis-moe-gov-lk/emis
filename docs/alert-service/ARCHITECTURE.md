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
6. [Data Flow](#6-data-flow)
7. [Database Schema](#7-database-schema)
8. [Project Structure](#8-project-structure)
9. [Technology Choices](#9-technology-choices)
10. [Authentication & Security](#10-authentication--security)
11. [Environment Configuration](#11-environment-configuration)
12. [Deployment](#12-deployment)

---

## 1. Why a Microservice

The alert service exists as a standalone service — not a module inside the Laravel backend, not a proxy wrapper — because **it owns its own database**. That is what makes it independently deployable and what makes it the common ground for all future services in the EMIS ecosystem.

The vision is that every future microservice in EMIS, regardless of language or framework, publishes alerts and notifications to this one service. A Python analytics service, a Go reporting service, a second Node service — they all speak to one place for alerts.

| Problem with the current setup | What the microservice solves |
|---------------------------------|------------------------------|
| Alert data lives in Laravel's DB, tightly coupled to the HRM domain | Alert service owns its own DB — decoupled from Laravel |
| Future services cannot publish alerts without touching Laravel | Any service can publish to the alert service's API |
| Frontend alert components fetch from different sources with different patterns | One service, one contract, one URL |
| Cannot scale alert reads independently from the rest of the backend | Alert service scales on its own |

---

## 2. System Context

```
┌──────────────────────────────────────────────────────────────────┐
│                      BROWSER (React SPA)                         │
│                                                                  │
│   Alert page → alertService.js → Alert Microservice URL         │
└─────────────────────────┬────────────────────────────────────────┘
                          │  HTTPS  Authorization: Bearer <token>
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│           Alert Microservice  (Node.js + Express)                │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   Alert MySQL DB                        │   │
│   │   owns: alerts, alert_counts, alert_metadata            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│              Phase 1: internal sync middleware                   │
│              reads from APIM/Laravel to populate DB              │
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
- Expose a clean HTTP API for reading alert data (counts + paginated lists)
- In Phase 1: populate the DB by reading from APIM/Laravel via an internal sync middleware
- Normalize all data into a consistent camelCase shape before storing and serving
- Log all requests and errors

**Out of scope (Phase 1):**

- Accepting alert events published by producers (Phase 2)
- WebSocket / Server-Sent Events for real-time updates (future)
- Performing workflow actions (verify, confirm, reject) — these remain direct frontend-to-APIM calls
- Any user authentication — JWT validation is still done by APIM/Laravel

---

## 4. Two-Phase Design

The service is designed so that the swap from Phase 1 to Phase 2 only replaces the data source layer — the DB schema, the controllers, and the API the frontend calls are the same in both phases.

### Phase 1 — Alert service reads from APIM/Laravel (now)

```
Frontend  ──►  Alert Service  ──►  Alert DB (read/serve)
                    │
              sync middleware
                    │
                    ▼
              APIM / Laravel  (source of alert data for now)
```

When the frontend requests alert data, the sync middleware fetches from APIM/Laravel, writes/upserts into the alert DB, and the controller serves from the DB. The DB is populated on demand.

### Phase 2 — Producers publish to the alert service (future)

```
Frontend  ──►  Alert Service  ──►  Alert DB (read/serve)
                    ▲
         Laravel publishes events here
         Future Service X publishes here
         Future Service Y publishes here
```

Laravel is modified to POST alert events to the service when workflow states change (teacher verified, rejected, etc.). The sync middleware is replaced by an event receiver. Everything else stays the same.

**The DB schema is designed for Phase 2 from day one** — so no migration is needed when the switch happens.

---

## 5. High-Level Architecture

```
alert-service/
│
├── src/
│   ├── app.js                   Express app setup, middleware registration
│   ├── server.js                HTTP server bootstrap
│   │
│   ├── config/
│   │   └── index.js             Read and validate all environment variables at startup
│   │
│   ├── routes/
│   │   └── alertRoutes.js       Route definitions: GET /api/alerts/*
│   │
│   ├── controllers/
│   │   └── alertController.js   Extract params → call service → send response
│   │
│   ├── services/
│   │   ├── alertService.js      Read from DB, return normalized data to controller
│   │   └── syncService.js       Phase 1: fetch from APIM/Laravel, upsert into DB
│   │
│   ├── db/
│   │   ├── connection.js        MySQL connection pool (mysql2)
│   │   └── migrations/          SQL migration files, run on startup
│   │       ├── 001_create_alerts.sql
│   │       └── 002_create_alert_counts.sql
│   │
│   └── middleware/
│       ├── auth.js              JWT presence check — rejects requests with no Bearer header
│       ├── errorHandler.js      Centralised error response formatting
│       └── requestLogger.js     Structured request logging (never logs Authorization header)
│
├── .env.example
├── .env                         (gitignored)
├── package.json
├── Dockerfile
└── .dockerignore
```

### Layer responsibilities

| Layer | File | Responsibility |
|-------|------|---------------|
| Route | `alertRoutes.js` | Map HTTP method + path to controller function |
| Controller | `alertController.js` | Extract params, trigger sync, call service, respond |
| Alert Service | `alertService.js` | Query the alert DB, return shaped data |
| Sync Service | `syncService.js` | Fetch from APIM/Laravel, upsert into alert DB |
| DB | `db/connection.js` | Manage MySQL2 connection pool |
| Auth middleware | `auth.js` | Reject requests missing `Authorization: Bearer` |
| Error middleware | `errorHandler.js` | Catch all errors, return consistent JSON |
| Config | `config/index.js` | Validate env vars at startup, crash if required ones are missing |

---

## 6. Data Flow

### Counts request (Primary tab)

```
1.  React Alert.jsx mounts
2.  alertService.getAlertCounts() called  [frontend/src/api/alertService.js]
3.  GET http://alert-service/api/alerts/counts
    + Authorization: Bearer <asgardeo-token>
4.  auth middleware: Bearer header present? → yes, continue
5.  alertController.getCounts() called
6.  syncService.syncCounts(token) called:
      a. GET APIM_BASE_URL/alerts/counts  + Bearer token
      b. APIM validates token → forwards to Laravel
      c. Laravel returns { pending_verification: N, revised: N, ... }
      d. Upsert into alert_counts table in Alert DB
7.  alertService.getCounts() reads from alert_counts table
8.  Returns normalized { pendingVerification: N, revised: N, ... }
9.  Controller sends 200
10. React renders count cards
```

### List request (any tab)

```
1.  User clicks Verification tab
2.  PendingVerificationList calls alertService.getPendingVerification({ page: 1, perPage: 20 })
3.  GET http://alert-service/api/alerts/pending-verification?page=1&per_page=20
    + Authorization: Bearer <token>
4.  auth middleware: Bearer present → continue
5.  alertController.getList() called with type="pending-verification"
6.  syncService.syncList(type, token, page, perPage) called:
      a. GET APIM_BASE_URL/alerts/pending-verification?page=1&per_page=20 + Bearer
      b. APIM → Laravel → returns paginated teacher list
      c. Normalize snake_case → camelCase
      d. Upsert records into alerts table with type="pending_verification"
7.  alertService.getList(type, page, perPage) reads from alerts table
8.  Returns { items: [...], pagination: { currentPage, lastPage, perPage, total } }
9.  Controller sends 200
10. PendingVerificationList sets state, passes data as props to AlertTeacherList
```

---

## 7. Database Schema

The alert service owns two tables. The schema is generic enough to accept alerts from any future producer without structural changes.

### `alerts` table

Stores every alert record. The `payload` column holds all display data so the service never needs to call back to a producer to render an alert.

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
  INDEX idx_alert_type  (alert_type),
  INDEX idx_people_id   (people_id),
  INDEX idx_status      (status),
  INDEX idx_synced_at   (synced_at)
);
```

**Column descriptions:**

| Column | Description |
|--------|-------------|
| `alert_type` | Category of the alert. Phase 1 values: `pending_verification`, `revised`, `pending_confirmation`, `rejected` |
| `producer` | Which system created this alert. Phase 1: `emis-hrm`. Future: any service name |
| `people_id` | The teacher or principal this alert relates to |
| `recipient_role` | Which role should see this alert (e.g. `ZEO Admin`). NULL = visible to all authorized roles |
| `status` | `active` = needs attention. `resolved` = actioned. `archived` = hidden |
| `payload` | JSON object with all display data — name, school, appointment date, rejection reason, etc. No lookups needed to render an alert |
| `external_ref` | ID in the producer's system (e.g. Laravel `people_id`) for deduplication during sync |
| `synced_at` | Last time this record was refreshed from upstream (Phase 1 only) |

**`payload` structure (Phase 1):**

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

The `rejection` key is only present for `alert_type = 'rejected'`.

---

### `alert_counts` table

Stores the latest count per alert type. Updated every time a sync runs.

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

## 8. Project Structure

The service lives at the **repo root** as a peer of `backend/` and `frontend/`:

```
emis/
├── backend/          Laravel + FrankenPHP (existing)
├── frontend/         React + Vite (existing)
├── alert-service/    Node.js + Express + MySQL (NEW)
├── infrastructure/
└── docs/
```

---

## 9. Technology Choices

| Concern | Choice | Reason |
|---------|--------|--------|
| Runtime | Node.js 20 LTS | Lightweight, fast I/O for a service that is mostly network calls and DB reads |
| Framework | Express 4 | Minimal, well-understood, no overhead |
| Database | MySQL 8 | Same DB engine used by the main EMIS stack; operations team already familiar |
| DB driver | `mysql2` | Promise-based, performant, widely used with Node |
| HTTP client | `axios` | Same library used in the frontend; consistent error handling |
| Environment | `dotenv` | Standard; `.env.example` pattern already used across this repo |
| Logging | `morgan` (HTTP) + structured `console` (errors) | Simple; no log aggregator dependency in Phase 1 |
| Containerisation | Docker | Consistent with how `backend/` and `frontend/` are run in this repo |

---

## 10. Authentication & Security

### User requests (Frontend → Alert Service)

The `auth` middleware checks that every protected request carries an `Authorization: Bearer` header. If it is missing, the request is rejected with `401` immediately — no upstream call is made.

The service does **not** validate the JWT itself. It forwards the Bearer token to APIM/Laravel in the sync call, and APIM/Laravel performs the actual validation.

### Service-to-service requests (Phase 2)

When producers (Laravel, future services) publish alert events to this service, they will use a dedicated **API key**, not a user JWT. The API key header will be:

```
X-Service-Key: <api-key>
```

API key auth middleware for the `POST /api/events/alert` endpoint will be added in Phase 2.

### CORS

`Access-Control-Allow-Origin` is restricted to the configured `CORS_ORIGIN` env var value. Wildcard `*` is never used in production.

### Logging

The `requestLogger` middleware must never log the value of the `Authorization` header.

---

## 11. Environment Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default: `3001`) | Port the Express server listens on |
| `APIM_BASE_URL` | Yes | APIM gateway base URL e.g. `https://services.app-uat.emis.moe.gov.lk/hrm/1.0.0` |
| `CORS_ORIGIN` | Yes | Allowed frontend origin e.g. `https://app-uat.emis.moe.gov.lk` |
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | No (default: `3306`) | MySQL port |
| `DB_NAME` | Yes | Alert service database name e.g. `emis_alerts` |
| `DB_USER` | Yes | MySQL user |
| `DB_PASSWORD` | Yes | MySQL password |
| `NODE_ENV` | No (default: `development`) | `development` or `production` |

---

## 12. Deployment

### Local development

```bash
cd alert-service
cp .env.example .env
# fill in DB_* and APIM_BASE_URL values
npm install
npm run dev        # nodemon — restarts on file changes
```

Service available at `http://localhost:3001`.  
Requires a local MySQL instance with the `emis_alerts` database created. Migrations run automatically on startup.

### Docker (local stack)

Added to `infrastructure/docker-swarm/docker-compose.local.yml` as a new service. A dedicated `alert-mysql` service is also added alongside it. Both join the existing Docker overlay network.

### Production

Added to `infrastructure/docker-swarm/docker-stack.yml`. The production MySQL for the alert service is a separate instance from the main EMIS MySQL — this enforces DB-level isolation between services.
