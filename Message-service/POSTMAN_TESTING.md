# Alert Service — Postman Testing Guide

**Base URL:** `http://localhost:3001`

---

## Setup

### Environment Variables (optional but handy)
In Postman, create an Environment with these variables:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3001` |
| `token` | *(paste your JWT Bearer token here)* |

Then use `{{base_url}}` and `{{token}}` in your requests.

---

## 1. Health Check
**Purpose:** Confirm the server is running. No token needed.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/health` |
| Auth | None |

**Expected Response — `200 OK`**
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

## 2. Alert Counts
**Purpose:** Get the badge counts for all alert tabs.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/alerts/counts` |
| Auth | Bearer Token |

**Headers:**
```
Authorization: Bearer <your_token>
```

**Expected Response — `200 OK`**
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

---

## 3. Pending Verification List
**Purpose:** Get paginated list of profiles awaiting first-level verification.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/alerts/pending-verification` |
| Auth | Bearer Token |

**Headers:**
```
Authorization: Bearer <your_token>
```

**Query Params (optional):**

| Key | Value | Notes |
|-----|-------|-------|
| `page` | `1` | Default: 1 |
| `per_page` | `20` | Default: 20, max: 100 |

**Full URL example:**
```
http://localhost:3001/api/alerts/pending-verification?page=1&per_page=20
```

**Expected Response — `200 OK`**
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

## 4. Revised List
**Purpose:** Get paginated list of profiles that were rejected and resubmitted.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/alerts/revised` |
| Auth | Bearer Token |

**Headers:**
```
Authorization: Bearer <your_token>
```

**Query Params (optional):**

| Key | Value |
|-----|-------|
| `page` | `1` |
| `per_page` | `20` |

**Expected Response — `200 OK`**
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

## 5. Pending Confirmation List
**Purpose:** Get paginated list of profiles awaiting employer confirmation.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/alerts/pending-confirmation` |
| Auth | Bearer Token |

**Headers:**
```
Authorization: Bearer <your_token>
```

**Query Params (optional):**

| Key | Value |
|-----|-------|
| `page` | `1` |
| `per_page` | `20` |

**Expected Response — `200 OK`**
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

## 6. Rejected List
**Purpose:** Get paginated list of rejected profiles including rejection reason.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/alerts/rejected` |
| Auth | Bearer Token |

**Headers:**
```
Authorization: Bearer <your_token>
```

**Query Params (optional):**

| Key | Value |
|-----|-------|
| `page` | `1` |
| `per_page` | `20` |

**Expected Response — `200 OK`**
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

---

## Error Cases to Verify

### Missing Token → 401
Send any protected request **without** the Authorization header.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/alerts/counts` |
| Auth | **None** |

**Expected Response — `401 Unauthorized`**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authorization header is missing or invalid."
  }
}
```

---

### Invalid Token → 401
Send a request with a fake/expired token.

**Header:**
```
Authorization: Bearer fake.token.here
```

**Expected Response — `401 Unauthorized`**
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

### Invalid Pagination → 400
Send `per_page` with a value above 100 or below 1.

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/alerts/pending-verification?per_page=999` |
| Auth | Bearer Token |

**Expected Response — `400 Bad Request`**
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "per_page must be an integer between 1 and 100"
  }
}
```

---

### Unknown Route → 404

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3001/api/something-random` |

**Expected Response — `404 Not Found`**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route not found."
  }
}
```

---

## Quick Checklist

| # | Test | Expected |
|---|------|----------|
| 1 | `GET /health` | `200` + `status: ok` |
| 2 | `GET /api/alerts/counts` — no token | `401 UNAUTHORIZED` |
| 3 | `GET /api/alerts/counts` — fake token | `401 UNAUTHORIZED` |
| 4 | `GET /api/alerts/counts` — valid token | `200` with counts |
| 5 | `GET /api/alerts/pending-verification` — valid token | `200` with items + pagination |
| 6 | `GET /api/alerts/revised` — valid token | `200` |
| 7 | `GET /api/alerts/pending-confirmation` — valid token | `200` |
| 8 | `GET /api/alerts/rejected` — valid token | `200` with `rejection` object in each item |
| 9 | `GET /api/alerts/pending-verification?per_page=999` | `400 BAD_REQUEST` |
| 10 | `GET /api/something-random` | `404 NOT_FOUND` |
