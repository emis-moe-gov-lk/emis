# Message Service — TODO

## Architecture / Decisions Pending

- [ ] What happens when a recipient's UUID changes? (WSO2 account re-created)
- [ ] Push notifications channel — out of scope for now, noted in REQUIREMENTS.md
- [ ] Pagination on thread messages (currently returns all — fine for low volume)
- [ ] Upgrade service-to-service auth from shared secret → IS client credentials (prod hardening)

---

## Done

- [x] Rename alert-service → Message-service folder
- [x] Rebrand package.json, server.js
- [x] Fix WSO2 JWT config (issuer + audience pointing to correct IS instance)
- [x] Fix DB user (`root` for local dev)
- [x] Create `notifications` table (migration 004)
- [x] Create `notification_recipients` table (migration 005)
- [x] Add `sender_name`, `sender_role_label` columns + FULLTEXT index (migration 006)
- [x] `GET /api/notifications/inbox` — flat inbox endpoint
- [x] `PATCH /api/notifications/:id/read` — mark read
- [x] `PATCH /api/notifications/:id/acknowledge` — acknowledge
- [x] `GET /api/messages/threads` — thread list grouped by sender (with FULLTEXT search support via ?q=)
- [x] `GET /api/messages/threads/:senderUuid` — messages from one sender (auto-marks read)
- [x] `POST /api/notifications/send` — full dispatch: calls Laravel to resolve scope → inserts recipients → marks sent (atomic transaction)
- [x] `GET /api/notifications/sent` — sent messages list (paginated, 120-char preview)
- [x] `GET /api/notifications/sent/:id` — full sent notification detail (full body, scope, channels)
- [x] Rate limit `POST /api/notifications/send` — 10 req / 10 min per IP via `sendLimit`
- [x] Validate required fields on `POST /api/notifications/send` — express-validator `sendRules`
- [x] Internal Laravel client (`src/lib/laravelClient.js`) with `X-Service-Key` header
- [x] `LARAVEL_BASE_URL` + `LARAVEL_SERVICE_SECRET` in Node.js config and `.env`
- [x] Laravel `ServiceKeyAuth` middleware — `hash_equals` check on `X-Service-Key`
- [x] Laravel `service.key` middleware alias registered in `bootstrap/app.php`
- [x] Laravel `MessageService/ScopeController` — resolve-recipients + estimate-reach (service.key auth)
- [x] Laravel `MessageService/ScopeListController` — provinces, zones, divisions, schools (auth:jwt)
- [x] Laravel route group `prefix('message-service/scope-lists')->middleware('auth:jwt')` in api.php
- [x] `MESSAGE_SERVICE_SECRET` added to Laravel `.env` and `.env.example`
- [x] Frontend `messageService.js` — all exports including `getThreadList`, `getThreadMessages`, `sendNotification`, `getSentNotifications`, `getSentById`, `getScopeProvinces`, `getScopeZones`, `getScopeDivisions`, `getScopeSchools`, `estimateReach`, `acknowledge`
- [x] `NotificationComposer.jsx` — slide-over drawer with scope cascade (province→zone→division→school), estimated reach counter, subject/body fields, urgent/ack toggles, channel checkboxes, send with spinner
- [x] Inbox.jsx — New button wires to composer, real API wired, Sent tab with full body detail (getSentById on select), debounced server-side FULLTEXT search (>= 3 chars), error banners with retry, loading skeletons
- [x] REQUIREMENTS.md written with full design decisions
- [x] CORS updated to allow POST, PATCH, DELETE
- [x] Error handler updated for structured `{ status, code, message }` errors
