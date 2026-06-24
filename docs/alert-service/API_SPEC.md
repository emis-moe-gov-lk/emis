# Alert Microservice — API Specification

**Base URL (local):** `http://localhost:3001`  
**Base URL (UAT):** `https://alerts.app-uat.emis.moe.gov.lk` *(TBD)*  
**All protected endpoints require:** `Authorization: Bearer <asgardeo-token>`

---

## Table of Contents

1. [General Conventions](#1-general-conventions)
2. [Authentication](#2-authentication)
3. [Endpoints](#3-endpoints)
   - [Health Check](#health-check)
   - [Get Alert Counts](#get-alert-counts)
   - [Pending Verification List](#pending-verification-list)
   - [Revised List](#revised-list)
   - [Pending Confirmation List](#pending-confirmation-list)
   - [Rejected List](#rejected-list)
4. [Error Responses](#4-error-responses)
5. [Data Source — Phase 1 vs Phase 2](#5-data-source--phase-1-vs-phase-2)

---

## 1. General Conventions

- All endpoints return `Content-Type: application/json`
- Successful responses always have the shape `{ "success": true, "data": <payload> }`
- Error responses always have the shape `{ "success": false, "error": { "code": "...", "message": "..." } }`
- Pagination parameters use `page` and `per_page` query strings
- All response property names are **camelCase** — the service normalizes snake_case data from upstream before storing in its own DB and serving to the frontend
- **The frontend API contract does not change between Phase 1 and Phase 2.** Only the internal data source changes.

---

## 2. Authentication

The service validates that a Bearer token is present on every protected request. The token itself is validated by APIM/Laravel — the alert service does not perform JWT validation.

**Required header on all protected endpoints:**

```
Authorization: Bearer <access_token>
```

If this header is missing or does not start with `Bearer `, the service returns `401` immediately without making any upstream or DB call.

---

## 3. Endpoints

---

### Health Check

```
GET /health
```

Public. No authentication required. Used by Docker health checks and uptime monitoring.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "alert-service",
    "timestamp": "2026-06-19T08:00:00.000Z"
  }
}
```

---

### Get Alert Counts

```
GET /api/alerts/counts
```

Returns the count of active records in each alert category. Powers the **Primary tab** overview cards and the badge numbers on each tab header.

**Data source:** `alert_counts` table in the alert service DB (populated by sync middleware from APIM/Laravel in Phase 1).

**Headers:**

```
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "pendingVerification": 12,
    "revised": 3,
    "pendingConfirmation": 7,
    "rejected": 2
  }
}
```

**Field descriptions:**

| Field | Description |
|-------|-------------|
| `pendingVerification` | Profiles submitted but not yet reviewed |
| `revised` | Profiles corrected and resubmitted after a rejection |
| `pendingConfirmation` | Profiles that passed verification, awaiting employer confirmation |
| `rejected` | Profiles fully rejected |

---

### Pending Verification List

```
GET /api/alerts/pending-verification
```

Returns a paginated list of teacher profiles awaiting first-level verification.

**Data source:** `alerts` table where `alert_type = 'pending_verification'` and `status = 'active'`.

**Headers:**

```
Authorization: Bearer <token>
```

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `per_page` | integer | `20` | Results per page (max: 100) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "peopleId": "P001234",
        "fullName": "Kamal Perera",
        "nameWithInitials": "K. Perera",
        "appointmentDate": "2024-03-15",
        "school": {
          "name": "Ananda College",
          "censusNo": "AC001"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "lastPage": 4,
      "perPage": 20,
      "total": 72
    }
  }
}
```

---

### Revised List

```
GET /api/alerts/revised
```

Returns a paginated list of teacher profiles that were rejected and have since been revised and resubmitted.

**Data source:** `alerts` table where `alert_type = 'revised'` and `status = 'active'`.

**Headers:**

```
Authorization: Bearer <token>
```

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `per_page` | integer | `20` | Results per page (max: 100) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "peopleId": "P001235",
        "fullName": "Nimal Silva",
        "nameWithInitials": "N. Silva",
        "appointmentDate": "2024-01-10",
        "school": {
          "name": "Royal College",
          "censusNo": "RC001"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "lastPage": 1,
      "perPage": 20,
      "total": 3
    }
  }
}
```

---

### Pending Confirmation List

```
GET /api/alerts/pending-confirmation
```

Returns a paginated list of teacher profiles that have been verified and are awaiting employer confirmation.

**Data source:** `alerts` table where `alert_type = 'pending_confirmation'` and `status = 'active'`.

**Headers:**

```
Authorization: Bearer <token>
```

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `per_page` | integer | `20` | Results per page (max: 100) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "peopleId": "P001236",
        "fullName": "Saman Fernando",
        "nameWithInitials": "S. Fernando",
        "appointmentDate": "2024-02-20",
        "school": {
          "name": "Nalanda College",
          "censusNo": "NC001"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "lastPage": 2,
      "perPage": 20,
      "total": 35
    }
  }
}
```

---

### Rejected List

```
GET /api/alerts/rejected
```

Returns a paginated list of teacher profiles that have been rejected, including the rejection reason.

**Data source:** `alerts` table where `alert_type = 'rejected'` and `status = 'active'`. The `rejection` object is stored in the `payload` JSON column — no secondary call is needed.

**Headers:**

```
Authorization: Bearer <token>
```

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `per_page` | integer | `20` | Results per page (max: 100) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "peopleId": "P001237",
        "fullName": "Ruwan Bandara",
        "nameWithInitials": "R. Bandara",
        "appointmentDate": "2023-12-05",
        "school": {
          "name": "Dharmaraja College",
          "censusNo": "DC001"
        },
        "rejection": {
          "reason": "Incomplete documentation",
          "rejectedAt": "2024-01-15"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "lastPage": 1,
      "perPage": 20,
      "total": 2
    }
  }
}
```

> The `rejection` object is always present on rejected list items. If no reason was recorded upstream, `reason` will be `null`.

---

## 4. Error Responses

All errors follow the same shape regardless of where they originate:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authorization header is missing or invalid."
  }
}
```

### Error codes

| HTTP Status | Code | When it occurs |
|-------------|------|---------------|
| `400` | `BAD_REQUEST` | Invalid or out-of-range query parameters |
| `401` | `UNAUTHORIZED` | Missing or malformed `Authorization: Bearer` header |
| `403` | `FORBIDDEN` | Upstream APIM/Laravel rejected the token (user lacks permission) |
| `502` | `UPSTREAM_ERROR` | APIM/Laravel returned an unexpected error during sync |
| `503` | `SERVICE_UNAVAILABLE` | Could not reach APIM/Laravel or could not reach alert DB |
| `500` | `INTERNAL_ERROR` | Unhandled exception inside the microservice |

---

## 5. Data Source — Phase 1 vs Phase 2

The **frontend API contract above does not change** between phases. What changes is where the data comes from internally.

### Phase 1 (current)

When the frontend calls any alert endpoint, the service:

1. Triggers `syncService` to fetch the latest data from APIM/Laravel using the forwarded Bearer token
2. Upserts the fetched data into the alert service's own MySQL DB
3. Reads from the DB and returns the result

| Microservice endpoint | Upstream APIM call (Phase 1 sync) |
|----------------------|----------------------------------|
| `GET /api/alerts/counts` | `GET /alerts/counts` |
| `GET /api/alerts/pending-verification` | `GET /alerts/pending-verification` |
| `GET /api/alerts/revised` | `GET /alerts/revised` |
| `GET /api/alerts/pending-confirmation` | `GET /alerts/pending-confirmation` |
| `GET /api/alerts/rejected` | `GET /alerts/rejected` + rejection comments merged into `payload` |

All upstream sync calls include the original `Authorization: Bearer` header from the client request.

### Phase 2 (future)

Producers (Laravel and future services) POST alert events directly to this service using a service API key. The sync middleware is removed. The DB is populated by incoming events, not by outbound polling. The read endpoints above remain exactly the same.
