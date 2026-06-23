# Alert & Notification Microservice — Proposal

**Branch:** `be/feat/alert-service`  
**Date:** 2026-06-19  
**Author:** EMIS Development Team  
**Status:** Proposed

---

## 1. Background

The EMIS system manages the appointment and verification workflow for teachers and principals across schools in Sri Lanka. When a teacher or principal profile is submitted, it goes through a structured approval chain involving multiple officers at different levels — verification officers, zonal education officers, and employer representatives.

Currently, the **Alert page** (referred to as the Inbox by users) is the only place in the system where officers can see what needs their attention. It shows:

- Profiles waiting for first-level verification
- Profiles that were rejected and revised by the applicant
- Profiles waiting for employer confirmation
- Profiles that have been rejected

This page is critical to daily operations. Officers log in and check the Alert page to find out what actions they need to take. Without it, the approval workflow has no visibility layer.

---

## 2. The Problem

### The Alert page is tightly coupled to the main Laravel backend

Right now, the Alert page fetches data directly from the EMIS backend through the APIM gateway. This means:

- **Alert data lives inside Laravel's database.** It is mixed together with teacher profiles, institutions, timetables, and everything else. There is no separation.
- **The frontend talks to APIM for every alert request.** If APIM or Laravel is slow or under load, the Alert page suffers too, even though it is a separate concern.
- **Future services cannot contribute to the Alert page.** If a new microservice is built in the future — say, a payroll service or a transfer request service — it has no clean way to send alerts or notifications to officers. It would have to write directly into Laravel's database, which defeats the purpose of having separate services.
- **The frontend code is inconsistent.** Alert data is fetched in three different ways across five different component files, with no single source of truth.

### This does not scale

As EMIS grows and more services are added, each service will have its own events that need to notify officers. Without a dedicated alert service, every new service would need to couple itself to Laravel or the frontend would need to call five different services to build one notification view.

---

## 3. The Proposal

We propose building a **dedicated Alert and Notification Microservice** — a standalone Node.js + Express backend with its own MySQL database.

### What it is

A standalone HTTP service that:
- Owns all alert and notification data in its own database
- Serves the Alert page (Inbox) in the EMIS frontend
- Acts as the common ground for alerts across all future EMIS microservices

### What it is not

- It is not a replacement for the main Laravel backend
- It is not a messaging system (no emails, no SMS in this phase)
- It is not a real-time push notification system (no WebSockets in this phase)

---

## 4. Main Purpose

> **The alert service is the single place in the EMIS ecosystem where any service can publish an alert, and any authorized user can read what needs their attention.**

Today that means: teacher and principal appointment workflow alerts for HR officers.

Tomorrow that means: any event from any service — a payroll discrepancy, a transfer request, a document expiry — can go through the same service and appear in the same officer inbox.

The service gives the EMIS system a **common notification layer** that is independent of any single backend technology. A Python service, a Go service, a second Node service — they all speak to one place.

---

## 5. What We Are Building

### Phase 1 — Foundation (current scope)

**Goal:** Get the Alert page reading from the microservice's own database instead of directly from APIM/Laravel.

**What we build:**

| Component | Description |
|-----------|-------------|
| Node.js + Express service | Standalone HTTP server at its own URL |
| Alert MySQL database | Own database with `alerts` and `alert_counts` tables |
| Sync middleware | Internal layer that reads from APIM/Laravel and populates the alert DB |
| REST API | 5 endpoints: counts + 4 paginated lists |
| Frontend service file | `alertService.js` — the only frontend file that knows the microservice URL |

**How it works in Phase 1:**

```
Frontend (React)
      │
      ▼
Alert Service (Node.js)
      │
      ├──► Alert MySQL DB (own database — serves the frontend)
      │
      └──► APIM / Laravel (sync middleware fetches from here to populate the DB)
```

The frontend no longer talks to APIM for alert data. It talks only to the alert service. The alert service handles fetching from APIM/Laravel internally and stores the data in its own database. The database is the source of truth from day one.

**What the frontend Alert page gains:**
- One clean URL for all alert data
- Consistent response shapes (camelCase, normalized)
- The rejection reason is included directly in the rejected list — no secondary API calls needed
- Foundation ready for Phase 2 with no frontend changes required

---

### Phase 2 — Event-Driven (future scope)

**Goal:** Remove the dependency on APIM/Laravel. Producers publish alerts directly to the service.

**What changes:**

| What | Phase 1 | Phase 2 |
|------|---------|---------|
| Data source | Sync middleware fetches from APIM/Laravel | Producers POST events to alert service |
| Laravel role | Source of data | Publisher of events |
| New services | Cannot contribute alerts | Can publish alerts with a service API key |
| Frontend API | Unchanged | Unchanged |

```
Frontend (React)
      │
      ▼
Alert Service (Node.js)
      │
      ▼
Alert MySQL DB
      ▲
      │── Laravel publishes events here
      │── Future Service A publishes here
      │── Future Service B publishes here
```

**The frontend never changes between Phase 1 and Phase 2.** Only the internal data pipeline changes.

---

## 6. Technology Stack

| Concern | Technology | Reason |
|---------|-----------|--------|
| Service runtime | Node.js 20 LTS | Lightweight, fast for I/O-heavy work |
| Framework | Express 4 | Simple, minimal, well-understood |
| Database | MySQL 8 | Same engine as the rest of EMIS; operations team is familiar |
| DB driver | mysql2 | Promise-based Node MySQL driver |
| HTTP client | axios | Same library used in the frontend |
| Containerisation | Docker | Same pattern as `backend/` and `frontend/` in this repo |

---

## 7. Database Design

The database is designed generically so it can accept alerts from any future producer without schema changes.

### `alerts` table

One row per alert record. The `payload` column holds all display data as JSON so the service never needs to call another service to render an alert.

Key columns:

| Column | Purpose |
|--------|---------|
| `alert_type` | Category: `pending_verification`, `revised`, `pending_confirmation`, `rejected` |
| `producer` | Which system created this alert (e.g. `emis-hrm`, future: `emis-payroll`) |
| `people_id` | The person this alert is about |
| `status` | `active`, `resolved`, or `archived` |
| `payload` | JSON — full display data: name, school, appointment date, rejection reason |
| `external_ref` | ID in the producer's system, used for deduplication during sync |

### `alert_counts` table

Stores the latest count per alert type. Updated on every sync. Used for the overview tab and tab badge numbers.

---

## 8. Impact on the Frontend Alert Page

The Alert page (Inbox) continues to look and work exactly the same for users. Under the hood:

- Each component now owns its data fetching and passes data down as props (cleaner separation)
- All alert API calls go through a new `alertService.js` file — changing the data source in future requires editing one file only
- The `AlertTeacherList` component becomes a pure display component — easier to test and reuse

**No visible change to users. Cleaner code for developers.**

---

## 9. What This Enables in the Future

Once the alert service is in place with its own database, future capabilities become straightforward additions:

| Future capability | What it requires |
|------------------|-----------------|
| Any new EMIS service sends alerts | Add a `POST /api/events/alert` endpoint with service API key auth |
| Real-time count updates (no page refresh) | Add WebSocket or Server-Sent Events layer on top of existing DB |
| Email or SMS notifications | Alert service triggers on new alert records |
| Notification history / audit trail | Already in the DB from day one — just expose a history endpoint |
| Mobile app inbox | Same REST API, same contract |

None of these require touching the main Laravel backend or the frontend Alert page structure.

---

## 10. Summary

| | Before | After |
|--|--------|-------|
| Alert data lives in | Laravel's shared database | Dedicated alert service database |
| Frontend talks to | APIM/Laravel directly | Alert microservice |
| Future services can publish alerts | No — must write to Laravel DB | Yes — POST to alert service API |
| Consistency of alert API calls | 3 different patterns across 5 files | One file, one contract |
| Foundation for notifications | Not present | In place from day one |
