# EMIS Message Service — Requirements

**Branch:** `be/feat/alert-service`
**Last updated:** 2026-06-24
**Status:** In progress

---

## 1. What This Is

A **one-way messaging service** for the EMIS education system. Authorized officers compose and send text messages to groups of users scoped by institution level and role. Recipients read messages in a WhatsApp-style inbox. There are **no replies** — messaging flows in one direction only (sender → recipients).

This is a standalone Node.js + Express microservice with its own MySQL database (`emis_alerts`). It does not share a database with the Laravel backend.

### What it is not

- Not a chat system (no replies, no real-time, no typing indicators)
- Not a replacement for the existing HR workflow alerts (`/api/alerts/*`)
- Not an email or SMS system (in-app delivery only for now)

---

## 2. UI Design

### Recipient view (Inbox)

Modelled on WhatsApp's layout.

```
┌─────────────────────────┬──────────────────────────────────────┐
│  LEFT PANEL             │  RIGHT PANEL                         │
│  ─────────────────────  │  ──────────────────────────────────  │
│  🔍 Search...           │  [Selected sender's name + role]     │
│                         │  [Scope label — e.g. All Teachers,   │
│  ● Kamal Perera         │   Western Province]                  │
│    Ministry Officer     │                                      │
│    Policy update fo...  │  ┌──────────────────────────────┐   │
│    2 min ago  [2 new]   │  │ Policy update for schools... │   │
│                         │  │ 23 Jun 2026                  │   │
│  ○ Nimal Silva          │  └──────────────────────────────┘   │
│    Zonal Director       │                                      │
│    Regarding the upc... │  ┌──────────────────────────────┐   │
│    Yesterday            │  │ URGENT: Circular 2026/45...  │   │
│                         │  │ 20 Jun 2026   ✓ Acknowledged │   │
└─────────────────────────┴──────────────────────────────────────┘
```

**Left panel** — one row per unique sender. Shows:
- Sender name + role
- Preview of their latest message to me
- Timestamp of latest message
- Unread count badge (if any unread messages from that sender)
- Blue dot indicator for senders with unread messages

**Right panel** — all messages from the selected sender, in chronological order (oldest at top, newest at bottom). Each message shows:
- Subject (bold)
- Body
- Date sent
- Urgent badge (if `is_urgent = 1`)
- Read status
- Acknowledged badge (if `require_ack = 1` and user has acknowledged)

### Sender view (Sent messages)

Same layout but the left panel shows conversations the sender initiated, one row per send event:
- Scope label (e.g. "All Teachers — Western Province")
- Preview of the message body
- Recipient count (e.g. "847 recipients")
- Date sent
- Read count (e.g. "312 / 847 read")

### New Message flow

1. Sender clicks **"New Message"** button
2. A form appears (based on `moe-notification-composer.html`) with:
   - **Scope selector** — Ministry / Province / Zonal / Division / School tabs, cascading dropdowns
   - **Audience** — By role, Everyone, or Specific user (search by name or user ID)
   - **Message body** — text only, no rich text
   - **Options** — Mark urgent, Require acknowledgement
   - **Estimated reach count** — live preview of how many users match the scope
3. Sender clicks **Send** or **Save as Draft**

### Search

A search bar at the top of the left panel searches across:
- Sender name
- Sender user ID (WSO2 `sub` UUID)
- Message subject
- Message body content

Search works for both recipient view (searching received messages) and sender view (searching sent messages).

---

## 3. Conversation Threading Model

A **thread** is all messages between one sender and one recipient, grouped together on the left panel — identical to how WhatsApp groups messages from the same contact into one conversation.

**Rule**: If sender A sends 3 separate messages to recipient B over 3 weeks, recipient B sees one thread in their left panel labelled "Sender A", with all 3 messages stacked in chronological order inside that thread.

There is no separate "conversation" entity in the database. A thread is derived by querying: all `notifications` where `sender_id = X` that have a `notification_recipients` row for the current user. The latest `sent_at` among those determines the ordering in the left panel.

---

## 4. User Stories

### Sender

- As an authorized officer, I can click "New Message" and compose a message scoped to a set of users so that I can communicate policy or instructions to the right people.
- As a sender, I can target recipients by institution level (Ministry / Province / Zonal / Division / School) and by role (Principal, Teacher, etc.) so that my message reaches only the relevant audience.
- As a sender, I can search for a specific individual by name or user ID and send directly to them.
- As a sender, I can see an estimated reach count while composing so I know how many people will receive the message before I send it.
- As a sender, I can mark a message urgent so recipients see it highlighted.
- As a sender, I can require acknowledgement so recipients must explicitly confirm they have seen the message.
- As a sender, I can save a draft and come back to send it later.
- As a sender, I can see all messages I have sent, grouped by send event, with read and acknowledged counts.

### Recipient

- As a recipient, I can see all senders who have messaged me in the left panel, ordered by most recent message.
- As a recipient, I can click a sender to see all messages they have sent me in chronological order.
- As a recipient, messages are automatically marked as read when I open the thread.
- As a recipient, I can acknowledge a message that requires acknowledgement.
- As a recipient, I can search my inbox by sender name, sender ID, or message content.
- As a recipient, I can see an unread count badge next to each sender with unread messages.

---

## 5. Scope Resolution — Laravel Integration

When a sender selects a scope (e.g. "all Teachers in Colombo Zone"), the message service must resolve this to a list of user WSO2 `sub` UUIDs. This data lives in the Laravel backend (`nnemis` database).

### How it works

1. Sender submits `POST /api/messages/send` with scope criteria JSON
2. Message service calls the Laravel backend at `POST /message-service/resolve-recipients` with the scope JSON and the sender's Bearer token
3. Laravel returns a list of `{ sub, name, role }` objects
4. Message service creates `notification_recipients` rows using those `sub` values as `people_id`
5. `sender_name` and `sender_role_label` are extracted from the JWT at send time and stored on the `notifications` row — so the inbox can display names without calling Laravel again

### Laravel backend folder

All Laravel code added for the message service lives in a **dedicated folder** — it does not mix with the existing HRM controllers:

```
backend/app/Http/Controllers/MessageService/
backend/app/Http/Requests/MessageService/
backend/routes/message-service.php
```

This keeps the message service integration isolated and easy to find.

### Scope criteria JSON

```json
{
  "level": "school",
  "province": "Western",
  "zonal": "Colombo",
  "division": "Colombo Division 1",
  "schools": ["Royal College", "Ananda College"],
  "audienceMode": "roles",
  "roles": ["principal", "teacher"]
}
```

| `audienceMode` | What's included |
|---------------|----------------|
| `roles` | `roles` array required — only those roles at the selected scope |
| `everyone` | All users at the selected institutions regardless of role |
| `individual` | `individualIds` array required — list of WSO2 `sub` UUIDs or searchable user IDs |

If the resolved recipient list is empty, the send is rejected with `422 EMPTY_RECIPIENT_LIST`.

---

## 6. Database Schema

### `notifications` table

One row per composed message. Stores the sender, content, scope criteria, and delivery metadata.

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  sender_id         VARCHAR(64)     NOT NULL,
  sender_name       VARCHAR(255)    NOT NULL,
  sender_role_label VARCHAR(64)         NULL,
  status            ENUM('draft','sent','cancelled')
                                    NOT NULL DEFAULT 'draft',
  subject           VARCHAR(255)    NOT NULL,
  body              TEXT            NOT NULL,
  is_urgent         TINYINT(1)      NOT NULL DEFAULT 0,
  require_ack       TINYINT(1)      NOT NULL DEFAULT 0,
  scope             JSON            NOT NULL,
  recipient_count   INT UNSIGNED    NOT NULL DEFAULT 0,
  sent_at           TIMESTAMP           NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sender_id  (sender_id),
  INDEX idx_status     (status),
  INDEX idx_sent_at    (sent_at),
  FULLTEXT idx_ft_search (subject, body)
);
```

| Column | Description |
|--------|-------------|
| `sender_id` | WSO2 `sub` UUID of the sender — stored at send time from JWT |
| `sender_name` | Display name of the sender — stored at send time, never needs a Laravel lookup |
| `sender_role_label` | Human-readable role label (e.g. "Ministry Officer") — stored at send time |
| `status` | `draft` → `sent` → (optionally) `cancelled` |
| `subject` | Required. Max 255 chars |
| `body` | Required. Plain text only |
| `is_urgent` | 1 = highlighted in recipient inbox |
| `require_ack` | 1 = recipient must explicitly acknowledge |
| `scope` | Full scope criteria JSON — kept for audit trail |
| `recipient_count` | Count of resolved recipients at send time |
| `sent_at` | Set when transitioning from `draft` to `sent` |

> **Why `sender_name` is stored here:** The inbox left panel must show the sender's name. Without this column, every inbox load would require a call to Laravel to resolve names from UUIDs — slow and unnecessary. Storing the name at send time solves this permanently.

---

### `notification_recipients` table

One row per recipient per notification. Tracks per-recipient read and acknowledge state.

```sql
CREATE TABLE IF NOT EXISTS notification_recipients (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  notification_id   INT UNSIGNED    NOT NULL,
  people_id         VARCHAR(64)     NOT NULL,
  read_at           TIMESTAMP           NULL,
  acknowledged_at   TIMESTAMP           NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notif_person (notification_id, people_id),
  INDEX idx_people_id         (people_id),
  INDEX idx_notification_id   (notification_id),
  CONSTRAINT fk_nr_notification
    FOREIGN KEY (notification_id) REFERENCES notifications(id)
    ON DELETE CASCADE
);
```

| Column | Description |
|--------|-------------|
| `people_id` | WSO2 `sub` UUID of the recipient — matches `sub` claim in the recipient's JWT |
| `read_at` | NULL until the recipient opens the thread |
| `acknowledged_at` | NULL until acknowledge is clicked (only relevant when `require_ack = 1`) |

---

## 7. API Endpoints

All endpoints require `Authorization: Bearer <asgardeo-token>` except `/health`.

Base path: `http://localhost:3001` (local), `https://messages.app-uat.emis.moe.gov.lk` (UAT)

---

### Recipient — Thread list (left panel)

```
GET /api/messages/threads?q=<search>&page=1&per_page=20
```

Returns one row per unique sender who has sent a message to the current user. Ordered by latest message `sent_at DESC`.

`q` searches sender name, sender ID, message subject, and message body.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "senderId": "e491043c-4de9-4102-adaa-4ee2f95dd8d3",
        "senderName": "Kamal Perera",
        "senderRoleLabel": "Ministry Officer",
        "latestSubject": "Policy update for Western Province schools",
        "latestPreview": "Please review the updated appointment circular...",
        "latestSentAt": "2026-06-23T10:00:00.000Z",
        "unreadCount": 2,
        "totalMessages": 3
      }
    ],
    "pagination": {
      "currentPage": 1,
      "lastPage": 1,
      "perPage": 20,
      "total": 1
    }
  }
}
```

---

### Recipient — Thread messages (right panel)

```
GET /api/messages/threads/:senderId?page=1&per_page=50
```

Returns all messages from a specific sender to the current user, ordered `sent_at ASC` (oldest first, like WhatsApp). Calling this endpoint automatically marks all unread messages in this thread as read.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "sender": {
      "id": "e491043c-4de9-4102-adaa-4ee2f95dd8d3",
      "name": "Kamal Perera",
      "roleLabel": "Ministry Officer"
    },
    "items": [
      {
        "id": 42,
        "subject": "Policy update for Western Province schools",
        "body": "Please review the updated appointment circular...",
        "isUrgent": false,
        "requireAck": true,
        "readAt": "2026-06-23T10:05:00.000Z",
        "acknowledgedAt": null,
        "sentAt": "2026-06-23T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "lastPage": 1,
      "perPage": 50,
      "total": 1
    }
  }
}
```

---

### Recipient — Acknowledge a message

```
PATCH /api/messages/:id/acknowledge
```

Sets `acknowledged_at` on the recipient row. Returns `422` if `require_ack = 0`. Idempotent.

**Response `200`:**

```json
{
  "success": true,
  "data": { "acknowledgedAt": "2026-06-23T10:31:00.000Z" }
}
```

---

### Sender — Compose and send (or save draft)

```
POST /api/messages
```

**Body:**

```json
{
  "subject": "Policy update for Western Province schools",
  "body": "Please review the updated appointment circular...",
  "isUrgent": false,
  "requireAck": true,
  "scope": {
    "level": "school",
    "province": "Western",
    "zonal": "Colombo",
    "division": "Colombo Division 1",
    "schools": ["Royal College", "Ananda College"],
    "audienceMode": "roles",
    "roles": ["principal", "teacher"]
  },
  "sendImmediately": true
}
```

**Validation:**

| Field | Rule |
|-------|------|
| `subject` | Required, 1–255 chars |
| `body` | Required, min 1 char |
| `scope.level` | Required, one of `ministry\|province\|zonal\|division\|school` |
| `scope.audienceMode` | Required, one of `roles\|everyone\|individual` |
| `scope.roles` | Required array when `audienceMode = "roles"` |
| `scope.individualIds` | Required array when `audienceMode = "individual"` |
| `sendImmediately` | Optional boolean, default `false` |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "status": "sent",
    "recipientCount": 847,
    "sentAt": "2026-06-23T10:00:00.000Z"
  }
}
```

---

### Sender — Send a saved draft

```
POST /api/messages/:id/send
```

Returns `404` if draft does not belong to caller. Returns `409` if already sent.

---

### Sender — Edit a draft

```
PATCH /api/messages/:id
```

Only allowed while `status = 'draft'`. Returns `409` if already sent.

---

### Sender — Sent messages list (left panel, sender view)

```
GET /api/messages/sent?q=<search>&page=1&per_page=20
```

Returns messages composed by the current user. `q` searches subject and body.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 42,
        "subject": "Policy update for Western Province schools",
        "bodyPreview": "Please review the updated appointment circular...",
        "scopeLabel": "Teachers & Principals — Colombo Division 1",
        "isUrgent": false,
        "requireAck": true,
        "recipientCount": 847,
        "readCount": 312,
        "acknowledgedCount": 210,
        "sentAt": "2026-06-23T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "lastPage": 1,
      "perPage": 20,
      "total": 1
    }
  }
}
```

---

### Sender — Draft list

```
GET /api/messages/drafts?page=1&per_page=20
```

Returns unsent drafts belonging to the current user.

---

### Reach estimation (live preview while composing)

```
POST /api/messages/estimate-reach
```

Calls Laravel `POST /message-service/estimate-reach` and returns the count. No DB writes.

**Body:** same `scope` object as compose payload.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "estimatedCount": 847,
    "breakdown": {
      "principal": 12,
      "teacher": 835
    }
  }
}
```

---

## 8. Permission Model

### Who can send

| Role | Can send to |
|------|------------|
| `super_admin`, `moe_admin` | Anyone — Ministry scope and below |
| `provincial_director` | Their own province and below |
| `zonal_director` | Their own zone and below |
| `divisional_director` | Their own division and below |
| `principal` | Teachers and staff at their own school only |
| All other roles | Cannot send — `403 FORBIDDEN` |

The message service checks the `roles` claim in the JWT against the table above. Attempting to send above the allowed scope returns `403 FORBIDDEN`.

### Who can receive

Any authenticated user can receive messages. All authenticated users can access their inbox (`GET /api/messages/threads`).

---

## 9. Search

Search (`?q=`) works across:

| Field searched | Where |
|---------------|-------|
| `sender_name` | Notifications table |
| `sender_id` (UUID) | Notifications table — lets you find messages by pasting a user ID |
| `subject` | Full-text index on notifications |
| `body` | Full-text index on notifications |

For the recipient view: search is limited to messages where the caller is a recipient.
For the sender view: search is limited to messages where the caller is the sender.

---

## 10. What Is Out of Scope

| Item | Reason |
|------|--------|
| Replies from recipients | By design — one-way only |
| Email / SMS delivery | Deferred — in-app only for now |
| Real-time delivery (WebSocket / SSE) | Deferred |
| Rich text / HTML body | Plain text only — avoids XSS surface |
| Message deletion by sender | Deferred |
| Scheduled sending | Column reserved in schema but not implemented |
| File attachments | Not in scope |
| Group chats where recipients see each other | Not in scope |

---

## 11. Backend Folder Structure (Laravel)

All Laravel code for the message service is isolated in a dedicated folder:

```
backend/
└── app/
    └── Http/
        └── Controllers/
            └── MessageService/
                ├── ResolveRecipientsController.php
                └── EstimateReachController.php
    └── Http/
        └── Requests/
            └── MessageService/
                └── ResolveRecipientsRequest.php
└── routes/
    └── message-service.php          ← registered separately in RouteServiceProvider
```

These routes use the existing `JwtGuard` auth middleware (same token validation as the rest of the backend).

---

## 12. Message Service File Structure

```
Message-service/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── index.js
│   ├── routes/
│   │   ├── alertRoutes.js           ← existing (Phase 1 HR workflow alerts)
│   │   ├── eventRoutes.js           ← existing (Phase 2 stub)
│   │   ├── notificationRoutes.js    ← existing (inbox read/ack)
│   │   └── messageRoutes.js         ← NEW (compose, threads, search, drafts)
│   ├── controllers/
│   │   ├── alertController.js
│   │   ├── notificationController.js
│   │   └── messageController.js     ← NEW
│   ├── services/
│   │   ├── alertService.js
│   │   ├── notificationService.js
│   │   └── messageService.js        ← NEW
│   ├── db/
│   │   ├── connection.js
│   │   ├── migrate.js
│   │   └── migrations/
│   │       ├── 001_create_alerts.sql
│   │       ├── 002_create_alert_counts.sql
│   │       ├── 003_create_service_keys.sql
│   │       ├── 004_create_notifications.sql
│   │       └── 005_create_notification_recipients.sql
│   └── middleware/
│       ├── auth.js
│       ├── cors.js
│       ├── helmet.js
│       ├── rateLimiter.js
│       ├── validate.js
│       ├── errorHandler.js
│       ├── requestLogger.js
│       └── serviceAuth.js
├── .env
├── .env.example
├── package.json
├── Dockerfile
└── REQUIREMENTS.md
```

---

## 13. Frontend Integration

The frontend uses `VITE_MESSAGE_SERVICE_URL` (default `http://localhost:3001`). All calls go through `frontend/src/api/messageService.js`.

| Action | Method + Path |
|--------|--------------|
| Load left panel (recipient) | `GET /api/messages/threads` |
| Load right panel (recipient) | `GET /api/messages/threads/:senderId` |
| Acknowledge a message | `PATCH /api/messages/:id/acknowledge` |
| Load sent list (sender) | `GET /api/messages/sent` |
| Load draft list (sender) | `GET /api/messages/drafts` |
| Compose / send | `POST /api/messages` |
| Send a draft | `POST /api/messages/:id/send` |
| Edit a draft | `PATCH /api/messages/:id` |
| Estimate reach | `POST /api/messages/estimate-reach` |
| Search (recipient) | `GET /api/messages/threads?q=keyword` |
| Search (sender) | `GET /api/messages/sent?q=keyword` |
