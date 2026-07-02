# Alert Microservice — Frontend Integration Guide

**Pattern:** Option B — each wrapper component owns its fetch, passes data down as props  
**Branch:** `be/feat/alert-service`  
**Last updated:** 2026-06-19

---

## Table of Contents

1. [What Changes and What Stays the Same](#1-what-changes-and-what-stays-the-same)
2. [Current State vs Target State](#2-current-state-vs-target-state)
3. [New File: alertService.js](#3-new-file-alertservicejs)
4. [Component Changes](#4-component-changes)
   - [Alert.jsx (page)](#alertjsx-page)
   - [PendingVerificationList.jsx](#pendingverificationlistjsx)
   - [PendingConfirmationList.jsx](#pendingconfirmationlistjsx)
   - [RevisedList.jsx](#revisedlistjsx)
   - [RejectedList.jsx](#rejectedlistjsx)
   - [AlertTeacherList.jsx](#alertteacherlistjsx)
5. [Component Data Flow Diagram](#5-component-data-flow-diagram)
6. [Environment Variable](#6-environment-variable)
7. [Files to Change Summary](#7-files-to-change-summary)

---

## 1. What Changes and What Stays the Same

### Changes

- A new `frontend/src/api/alertService.js` is created — the **only file** that knows the alert microservice URL. Changing the data source in the future means editing this one file.
- `Alert.jsx` replaces its inline `api.get('/alerts/counts')` with `alertService.getAlertCounts()`
- The four list components (`PendingVerificationList`, `PendingConfirmationList`, `RevisedList`, `RejectedList`) each call their own `alertService` function instead of calling `api` directly
- `AlertTeacherList.jsx` becomes a **pure presentation component** — all fetch logic removed, receives data as props
- `AlertsOverview.jsx` prop names updated from snake_case to camelCase to match the microservice response

### Stays the same

- The Alert page UI, tab structure, and all visual styling — unchanged
- Routing, permissions (`PermissionGroups`), and `Can` wrappers — unchanged
- The Asgardeo JWT flow — `alertService.js` uses the same axios instance, so the token interceptor still attaches the Bearer header automatically
- `RevisedList` and `RejectedList` rendering logic — only the API call line changes

> **Important:** The alert microservice has its own MySQL database. The frontend talks to the microservice, not to APIM/Laravel directly for alert data. The microservice handles fetching from APIM/Laravel internally (Phase 1) and will receive events from producers directly in Phase 2. The frontend API contract is the same in both phases.

---

## 2. Current State vs Target State

### Current state — 3 inconsistent patterns, 5 files with raw API calls

```
Alert.jsx
  └── api.get('/alerts/counts')                           ← inline fetch, APIM/Laravel directly

PendingVerificationList.jsx
  └── AlertTeacherList (endpoint="/alerts/pending-verification")
        └── api.get(`${endpoint}?page=...`)               ← fetch inside display component

PendingConfirmationList.jsx
  └── AlertTeacherList (endpoint="/alerts/pending-confirmation")
        └── api.get(`${endpoint}?page=...`)               ← same pattern

RevisedList.jsx
  └── api.get('/alerts/revised?page=...')                 ← inline fetch, own boilerplate

RejectedList.jsx
  └── api.get('/alerts/rejected?page=...')                ← inline fetch, duplicate boilerplate
```

### Target state — one service file, clean separation

```
Alert.jsx
  └── alertService.getAlertCounts()                       ← microservice, own DB

PendingVerificationList.jsx
  ├── alertService.getPendingVerification(page)           ← microservice, own DB
  └── passes { items, loading, currentPage, lastPage, onPageChange } to:
        └── AlertTeacherList  (pure display — no fetch)

PendingConfirmationList.jsx
  ├── alertService.getPendingConfirmation(page)           ← microservice, own DB
  └── passes data to AlertTeacherList

RevisedList.jsx
  └── alertService.getRevised(page)                       ← microservice, own DB

RejectedList.jsx
  └── alertService.getRejected(page)                      ← microservice, own DB
```

---

## 3. New File: alertService.js

**Path:** `frontend/src/api/alertService.js`

This file creates a **separate axios instance** that points to the alert microservice base URL, distinct from the main APIM-facing instance in `axios.jsx`. Both instances use the same Asgardeo token interceptor pattern.

```
frontend/src/api/
├── axios.jsx            ← existing — points to APIM_BASE_URL, unchanged
├── auth.jsx             ← existing, unchanged
└── alertService.js      ← NEW — points to ALERT_SERVICE_URL
```

### Why a separate axios instance

The main `axios.jsx` instance's `baseURL` is the APIM gateway (`VITE_API_BASE_URL`). The alert microservice is a different service at a different URL (`VITE_ALERT_SERVICE_URL`). They both get the same Bearer token attached by the same interceptor logic, but they need different base URLs.

### What it exports

| Function | Parameters | Returns |
|----------|-----------|---------|
| `getAlertCounts()` | — | `{ pendingVerification, revised, pendingConfirmation, rejected }` |
| `getPendingVerification(page, perPage)` | `page: number`, `perPage: number` | `{ items, pagination }` |
| `getRevised(page, perPage)` | `page: number`, `perPage: number` | `{ items, pagination }` |
| `getPendingConfirmation(page, perPage)` | `page: number`, `perPage: number` | `{ items, pagination }` |
| `getRejected(page, perPage)` | `page: number`, `perPage: number` | `{ items, pagination }` |

### Response shapes returned to components

**`getAlertCounts()`**
```js
{
  pendingVerification: 12,
  revised: 3,
  pendingConfirmation: 7,
  rejected: 2
}
```

**All list functions** — same shape:
```js
{
  items: [
    {
      peopleId: "P001234",
      fullName: "Kamal Perera",
      nameWithInitials: "K. Perera",
      appointmentDate: "2024-03-15",
      school: {
        name: "Ananda College",
        censusNo: "AC001"
      }
      // rejected list also includes:
      // rejection: { reason: "...", rejectedAt: "2024-01-15" }
    }
  ],
  pagination: {
    currentPage: 1,
    lastPage: 4,
    perPage: 20,
    total: 72
  }
}
```

---

## 4. Component Changes

### Alert.jsx (page)

**What changes:** Replace inline `api.get('/alerts/counts')` useEffect with `alertService.getAlertCounts()`.

**Before:**
```js
import api from "@/api/axios";

useEffect(() => {
  api.get("/alerts/counts")
    .then((res) => {
      if (res.data?.status === "success") {
        setCounts(res.data.data);
      }
    })
    .catch(() => {});
}, []);
```

**After:**
```js
import { getAlertCounts } from "@/api/alertService";

useEffect(() => {
  getAlertCounts()
    .then(setCounts)
    .catch(() => {});
}, []);
```

The `counts` state shape changes from Laravel snake_case to the microservice's camelCase:
```js
// Before (Laravel shape)
{ pending_verification: 0, revised: 0, pending_confirmation: 0, rejected: 0 }

// After (microservice shape)
{ pendingVerification: 0, revised: 0, pendingConfirmation: 0, rejected: 0 }
```

The `AlertsOverview` component props must be updated to match — see below.

---

### AlertsOverview.jsx

**What changes:** Prop names only — `pendingVerificationCount` and `pendingConfirmationCount` stay the same (they were already camelCase), but the values passed from `Alert.jsx` now come from the camelCase response keys.

The `Alert.jsx` call site changes from:
```jsx
<AlertsOverview
  pendingVerificationCount={counts.pending_verification}
  pendingConfirmationCount={counts.pending_confirmation}
  revisedCount={counts.revised}
  rejectedCount={counts.rejected}
/>
```
To:
```jsx
<AlertsOverview
  pendingVerificationCount={counts.pendingVerification}
  pendingConfirmationCount={counts.pendingConfirmation}
  revisedCount={counts.revised}
  rejectedCount={counts.rejected}
/>
```

The `AlertsOverview.jsx` component itself does not change.

---

### PendingVerificationList.jsx

**What changes:** From a thin wrapper that passes `endpoint` to `AlertTeacherList`, to a component that owns fetch state and passes data down.

**Before:**
```jsx
const PendingVerificationList = () => (
  <AlertTeacherList
    endpoint="/alerts/pending-verification"
    title="Pending Verification"
    subtitle="Profiles awaiting approval"
    color="yellow"
    headerBadge={{ color: "yellow", label: "Pending" }}
    rowBadge={{ color: "warning", label: "Pending" }}
    emptyText="No teachers pending verification."
    viewPermission={PermissionGroups.ALERTS.PROFILE_VERIFY}
  />
);
```

**After:** Owns `items`, `loading`, `currentPage`, `lastPage` state. Calls `getPendingVerification`. Passes all state and data as props to `AlertTeacherList`.

```jsx
const PendingVerificationList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getPendingVerification(currentPage)
      .then((result) => {
        setItems(result.items);
        setLastPage(result.pagination.lastPage);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentPage]);

  return (
    <AlertTeacherList
      teachers={items}
      loading={loading}
      currentPage={currentPage}
      lastPage={lastPage}
      onPageChange={setCurrentPage}
      title="Pending Verification"
      subtitle="Profiles awaiting approval"
      color="yellow"
      headerBadge={{ color: "yellow", label: "Pending" }}
      rowBadge={{ color: "warning", label: "Pending" }}
      emptyText="No teachers pending verification."
      viewPermission={PermissionGroups.ALERTS.PROFILE_VERIFY}
    />
  );
};
```

---

### PendingConfirmationList.jsx

Identical pattern to `PendingVerificationList`. Calls `getPendingConfirmation` instead.

---

### RevisedList.jsx

**What changes (minimal):** Already owns fetch state and has its own rendering. Only the API call line changes.

**Before:**
```js
api.get(`/alerts/revised?per_page=20&page=${currentPage}`)
  .then((res) => {
    if (res.data?.status === "success") {
      setTeachers(res.data.data.data ?? []);
      setLastPage(res.data.data.last_page ?? 1);
    }
  })
```

**After:**
```js
getRevised(currentPage)
  .then((result) => {
    setTeachers(result.items);
    setLastPage(result.pagination.lastPage);
  })
```

Remove `import api from "@/api/axios"`, add `import { getRevised } from "@/api/alertService"`. All rendering logic is unchanged.

---

### RejectedList.jsx

Same minimal change as `RevisedList`. Call `getRejected` instead of `api.get`.

The rejection reason modal is unaffected — it reads `selectedItem.rejection.reason` from the already-fetched item, which the microservice now includes directly in the `payload` (no secondary call needed).

**Before:**
```js
api.get(`/alerts/rejected?per_page=20&page=${currentPage}`)
  .then((res) => {
    if (res.data?.status === "success") {
      setTeachers(res.data.data.data ?? []);
      setLastPage(res.data.data.last_page ?? 1);
    }
  })
```

**After:**
```js
getRejected(currentPage)
  .then((result) => {
    setTeachers(result.items);
    setLastPage(result.pagination.lastPage);
  })
```

---

### AlertTeacherList.jsx

**What changes:** All fetch logic is removed. The component becomes a pure display component.

**Props — before:**
```
endpoint         string    Raw API path — component fetches from this URL
title            string
subtitle         string
color            string
headerBadge      object
rowBadge         object
emptyText        string
viewPermission   string
```

**Props — after:**
```
teachers         array     Teacher records to display (from parent)
loading          boolean   Whether the parent fetch is in progress
currentPage      number    Current pagination page (from parent state)
lastPage         number    Total pages (from parent state)
onPageChange     function  Called with the new page number when user clicks pagination
title            string
subtitle         string
color            string
headerBadge      object
rowBadge         object
emptyText        string
viewPermission   string
```

The JSX render output is **unchanged** — same teacher cards, same search input, same pagination buttons, same empty state. The internal `useEffect`, `useState` for teachers/loading/page, and the `api.get` call are all removed.

---

## 5. Component Data Flow Diagram

```
Alert.jsx (page)
│
├── alertService.getAlertCounts()
│     └── <AlertsOverview />
│           props: pendingVerificationCount, revised, pendingConfirmation, rejected
│
├── <PendingVerificationList />
│     ├── owns state: items, loading, currentPage, lastPage
│     ├── alertService.getPendingVerification(page)  [from alert microservice DB]
│     └── <AlertTeacherList />  ← pure display
│           props: teachers, loading, currentPage, lastPage, onPageChange, ...ui
│
├── <PendingConfirmationList />
│     ├── owns state: items, loading, currentPage, lastPage
│     ├── alertService.getPendingConfirmation(page)  [from alert microservice DB]
│     └── <AlertTeacherList />  ← pure display
│           props: teachers, loading, currentPage, lastPage, onPageChange, ...ui
│
├── <RevisedList />
│     ├── owns state: teachers, loading, currentPage, lastPage
│     ├── alertService.getRevised(page)  [from alert microservice DB]
│     └── renders own UI
│
└── <RejectedList />
      ├── owns state: teachers, loading, currentPage, lastPage
      ├── alertService.getRejected(page)  [from alert microservice DB]
      └── renders own UI + rejection reason modal
            rejection.reason comes directly from microservice payload — no secondary call
```

---

## 6. Environment Variable

The alert microservice URL is a Vite build-time variable. Add to both `frontend.env` and `frontend.env.example`:

```
VITE_ALERT_SERVICE_URL=http://localhost:3001
```

Production value:
```
VITE_ALERT_SERVICE_URL=https://alerts.app-uat.emis.moe.gov.lk
```

> **Reminder from CLAUDE.md:** `VITE_*` variables are baked into the bundle at build time. After changing this value, run `scripts/rebuild.sh frontend` — restarting the container alone has no effect.

---

## 7. Files to Change Summary

| File | Change type | What changes |
|------|------------|--------------|
| `frontend/src/api/alertService.js` | **New file** | Separate axios instance + all 5 alert service functions |
| `frontend/src/pages/Alert.jsx` | Edit | Replace inline `api.get` with `alertService.getAlertCounts()`; update prop names passed to `AlertsOverview` |
| `frontend/src/components/Alert/AlertTeacherList.jsx` | Edit | Remove fetch logic; replace `endpoint` prop with `teachers`, `loading`, `currentPage`, `lastPage`, `onPageChange` |
| `frontend/src/components/Alert/PendingVerificationList.jsx` | Edit | Own fetch state; call `getPendingVerification`; pass data to `AlertTeacherList` |
| `frontend/src/components/Alert/PendingConfirmationList.jsx` | Edit | Own fetch state; call `getPendingConfirmation`; pass data to `AlertTeacherList` |
| `frontend/src/components/Alert/RevisedList.jsx` | Edit | Swap `api.get` for `alertService.getRevised()`; update response field names |
| `frontend/src/components/Alert/RejectedList.jsx` | Edit | Swap `api.get` for `alertService.getRejected()`; update response field names |
| `frontend.env` | Edit | Add `VITE_ALERT_SERVICE_URL` |
| `frontend.env.example` | Edit | Add `VITE_ALERT_SERVICE_URL` |
