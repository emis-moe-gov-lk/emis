# EMIS — repo guide

EMIS HRM is a Laravel backend + React frontend authenticated through WSO2 (Identity Server + API Manager). Production runs on a Docker Swarm cluster; local dev runs the same stack via Docker Compose using an override file.

## Repo layout (the parts that matter for day-to-day work)

```
backend/                       Laravel app + Dockerfile
frontend/                      React app + Dockerfile
is/                            WSO2 IS image build (deployment.toml etc.)
apim/                          WSO2 APIM image build
infrastructure/
  docker/docker-compose.yml    OLD single-host compose file (kept as reference, not used)
  docker-swarm/                Authoritative deploy config — used for prod swarm AND local compose
    docker-stack.yml             Base file. Untouched between prod and local.
    docker-compose.local.yml     Local-dev override (bridge net, restart keys, mysql, build:)
    *.env                        Runtime config (gitignored — copy from *.env.example)
    .env                         Image repo/tag vars (gitignored — copy from .env.example)
    scripts/setup.sh             One-shot local bootstrap
    scripts/rebuild.sh           Rebuild + restart one service after code change
  ansible/                     Prod deploy automation; renders the swarm .env from vars.yml
```

## Local development

### First-time setup

```bash
cd infrastructure/docker-swarm
./scripts/setup.sh
```

That script copies any missing `*.env` from `*.env.example`, builds all four images (WSO2 IS, WSO2 APIM, frontend, backend) from local Dockerfiles, and starts the stack with a local MySQL container. **First build pulls multi-GB WSO2 base images — expect 10–20 minutes.**

**WSO2 needs its databases seeded** (4 dbs with latin1 charset + the `wso2-user` user). Reuse the prod ansible playbook against the local mysql container:

```bash
cd ../ansible
ANSIBLE_CONFIG=/tmp/ansible-local.cfg ansible-playbook \
  -i inventory/local.yml playbooks/mysql-setup-wso2.yml \
  --start-at-task="Create a temporary directory on the remote host" \
  -e ansible_become=false \
  -e varsfl_mysql_host=127.0.0.1 -e varsfl_mysql_port=3308 \
  -e varsfl_mysql_root_user=root -e varsfl_mysql_root_password=root \
  -e varsfl_mysql_user_configured=wso2-user \
  -e varsfl_mysql_user_configured_password=WSO2@User4
```

(Where `/tmp/ansible-local.cfg` is a minimal `[defaults]\nstdout_callback = default` file — the project's ansible.cfg references a removed callback plugin.) After this, `docker compose ... up -d --no-deps wso2-is wso2-apim` to pick up the new DB. Expect ~100s for IS and ~125s for APIM to fully boot.

After setup, the stack runs on:

| Service     | URL                                      | Notes                                 |
| ----------- | ---------------------------------------- | ------------------------------------- |
Primary access is through the nginx-proxy on standard 443 with UAT-mirror hostnames (requires `/etc/hosts` entries — `setup.sh` prints them):

| Service      | URL                                        | Notes                                 |
| ------------ | ------------------------------------------ | ------------------------------------- |
| Frontend     | https://app-uat.emis.moe.gov.lk            |                                       |
| Backend      | https://api-uat.emis.moe.gov.lk            | FrankenPHP, fronted by nginx          |
| WSO2 IS      | https://idp.app-uat.emis.moe.gov.lk/carbon | admin / `IS_ADMIN_PASSWORD` in is.env |
| WSO2 APIM    | https://apim.app-uat.emis.moe.gov.lk/carbon| admin / `APIM_ADMIN_PASSWORD`         |
| APIM Gateway | https://services.app-uat.emis.moe.gov.lk   | API traffic                           |

Browser will warn about the self-signed cert; accept once per host. Direct ports still work for debugging:

| Service     | Direct URL                               | Notes                                 |
| ----------- | ---------------------------------------- | ------------------------------------- |
| Backend     | http://localhost:9000                    | FrankenPHP (Caddy + PHP), HTTP        |
| WSO2 IS     | https://localhost:9444                   | admin / `IS_ADMIN_PASSWORD` in is.env |
| WSO2 APIM   | https://localhost:9443                   | admin / `APIM_ADMIN_PASSWORD`         |
| MySQL       | localhost:3308                           | emis / emis (root password: root)     |

Frontend backend calls route **through the APIM gateway**, not directly to Laravel: `VITE_API_BASE_URL=https://services.app-uat.emis.moe.gov.lk/hrm/1.0.0` (local and prod). APIM strips the `/hrm/1.0.0` context and forwards to the backend's `/api/...` endpoint, forwarding the IS-issued Bearer token unchanged.

### Day-to-day dev cycle

After changing code in `backend/` or `frontend/`, rebuild just that service:

```bash
cd infrastructure/docker-swarm
./scripts/rebuild.sh backend     # or frontend / wso2-is / wso2-apim / all
```

That rebuilds the image, restarts the container with `--no-deps` (so it doesn't restart MySQL), and tails logs.

### Common commands

All from `infrastructure/docker-swarm/`:

```bash
# Raw compose handle the scripts use
docker compose -f docker-stack.yml -f docker-compose.local.yml <subcommand>

# Status / logs
docker compose -f docker-stack.yml -f docker-compose.local.yml ps
docker compose -f docker-stack.yml -f docker-compose.local.yml logs -f backend

# Stop everything
docker compose -f docker-stack.yml -f docker-compose.local.yml down

# Stop + wipe local MySQL data
docker compose -f docker-stack.yml -f docker-compose.local.yml down -v
```

### OAuth credential flow

WSO2 IS issues fresh client_ids/secrets every time `configure-is-and-apim.yml` runs. To avoid stale values in `frontend.env` / `backend.env`, the flow is:

**Local (automated):** `setup.sh` orchestrates `configure-is-and-apim.yml` → `scripts/configure-auth.sh`. The auth script queries IS directly (admin / `ADMIN11`) for the SPA client_id (EMIS Web App) and M2M client_id+secret (CEMIS-LK M2M), writes them into the env files via an idempotent `set_env_var` helper, rebuilds the frontend (Vite bakes `VITE_*` at build time, not container start), and restarts the backend. Re-runnable by hand: `./scripts/configure-auth.sh`.

**Prod swarm (manual paste):** after `configure-is-and-apim.yml` runs against the prod IS/APIM, copy the printed credentials from its `Display generated credentials` / `Display M2M application credentials` debug tasks into `infrastructure/ansible/vars.yml`:

- `varsfl_vite_asgardeo_client_id` ← SPA client_id (EMIS Web App)
- `varsfl_wso2_m2m_client_id` ← CEMIS-LK M2M client_id
- `varsfl_wso2_m2m_client_secret` ← CEMIS-LK M2M client_secret
- `varsfl_vite_api_base_url` ← `https://services.app-uat.emis.moe.gov.lk/hrm/1.0.0` (the APIM gateway URL for the published EMIS-HRM API)

Then re-run `deploy-frontend.yml` and `deploy-backend.yml` (each re-renders its env file from a j2 template). Deliberately not automated — human-reviewed secret movement, infrequent re-deploys.

**Test users (local only)** seeded by the playbook from `infrastructure/ansible/resources/users-roles.yml`:

| Username | Password | Role |
|---|---|---|
| `teacher1` | `Teacher@123` | Teacher |
| `principal1` | `Principal@123` | Principal |
| `dataentry1` | `DataEntry@123` | DataEntry |

### Things to know about the backend startup

The backend image is **FrankenPHP** (Caddy + PHP bundled). Container listens on HTTP port 80, mapped to host 9000. The container's command (from `docker-stack.yml`) runs on every start:

```
composer install --no-interaction
cp .env.example .env
php artisan key:generate --force
php artisan migrate:fresh --seed --force
frankenphp run --config /etc/caddy/Caddyfile
```

The local override sets `SERVER_NAME: ":80"` on the backend service, which tells Caddy to listen HTTP-only and skip its auto-HTTPS / auto-cert behavior — necessary because in local-dev we sit behind a reverse proxy that handles TLS.

`migrate:fresh --seed --force` **wipes and reseeds the database every time the container starts.** Locally that's fine — it hits the local MySQL container. In prod swarm it hits the configured DB, so be careful when changing this command.

The override file points the backend at the local `mysql` service via inline `environment:` (which takes precedence over `env_file: backend.env`). The UAT IP in `backend.env` is harmless locally because the override wins.

## Production deploys

Production is a real Docker Swarm. The same `docker-stack.yml` is used, deployed via:

```bash
docker stack deploy -c docker-stack.yml emis
```

Ansible (`infrastructure/ansible/`) handles rendering the real image registry values into `.env` on the swarm node from `vars.yml` (also gitignored). **Do not edit `docker-stack.yml` in ways that break swarm semantics** — the `deploy:` blocks, the overlay network, and the absence of `build:` directives are intentional. Local-only adjustments belong in `docker-compose.local.yml`.

## Env file conventions

- `*.env` files (apim.env, backend.env, frontend.env, is.env, .env) are gitignored.
- `*.env.example` files are committed — they document the schema with secrets blanked.
- When adding a new variable, update both the real file and the example.
- The `infrastructure/docker/docker-compose.yml` file is older and not used; do not modify it.
