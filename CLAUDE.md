# EMIS — repo guide for Claude Code

Architecture, local setup, and production deployment live in [README.md](README.md). This file captures **non-obvious conventions and traps** specific to working in this codebase — read both.

## Repo layout (essentials)

```
backend/                          Laravel + FrankenPHP image
frontend/                         React + Vite image
is/, apim/                        WSO2 IS / APIM image builds
infrastructure/
  docker-swarm/                   Authoritative deploy config — shared by prod swarm AND local compose
    docker-stack.yml                Base stack file (untouched between prod & local)
    docker-compose.local.yml        Local-dev override (build:, bridge net, mysql, nginx-proxy)
    nginx-proxy/                    Local-only TLS terminator
    scripts/                        setup.sh, rebuild.sh, configure-auth.sh
  ansible/                        Configuration playbooks (IS/APIM setup, users/roles/APIs)
  docker/                         OLD single-host compose file — kept for reference, NOT used
```

## Hard rules

- **Do not edit `docker-stack.yml`** in ways that break swarm semantics. The `deploy:` blocks, the overlay network, and the absence of `build:` directives are intentional. Local-only adjustments belong in `docker-compose.local.yml`.
- **Do not modify `infrastructure/docker/docker-compose.yml`** or treat the `deploy-*.yml` ansible playbooks as authoritative — they reference that older compose file and are not part of the current prod flow. Prod is `docker stack deploy -c docker-stack.yml emis` + `configure-is-and-apim.yml`.
- **When adding an env variable, update both the real file and the `*.env.example`.** Real `*.env` files (including the image-tag `.env`) are gitignored — the example is the only committed source of schema truth.
- **The backend container runs `php artisan migrate:fresh --seed --force` on every start** (`docker-stack.yml` `backend.command`). That **wipes and reseeds the DB**. Harmless locally (own mysql container), destructive in prod. Be deliberate before changing this command.
- **`VITE_*` values are baked at build time**, not read at container start. After changing any `VITE_*` in `frontend.env`, rebuild the frontend image — restarting alone does nothing. `scripts/rebuild.sh frontend` does this correctly; ad-hoc `docker compose build frontend` requires `set -a; source frontend.env; set +a` first so the build args interpolate.

## Operational habits

- After changing source in `backend/` or `frontend/` locally, run `infrastructure/docker-swarm/scripts/rebuild.sh <service>` — code-only changes still need a rebuild because the Dockerfiles `COPY` source at build time.
- When editing `infrastructure/docker-swarm/nginx-proxy/nginx.conf`, the bind-mount is a single-file mount. Atomic-write editors (the Claude Code `Edit` tool included) change the inode and break the bind. After editing it, run `docker compose -f docker-stack.yml -f docker-compose.local.yml up -d --force-recreate nginx-proxy`. `nginx -s reload` will silently keep using the old inode. `sed -i` doesn't have this problem.
- Running ansible playbooks by hand locally: the project's `ansible.cfg` references a removed callback plugin, so use a minimal local override: `ANSIBLE_CONFIG=/tmp/ansible-emis-local.cfg ansible-playbook ...` where `/tmp/ansible-emis-local.cfg` is just `[defaults]\nstdout_callback = default`. `setup.sh` writes this for you.

## OAuth credential rotation

WSO2 IS reissues `client_id`/`client_secret` values every time `configure-is-and-apim.yml` runs. Locally, `scripts/configure-auth.sh` (invoked by `setup.sh`) harvests them into `frontend.env`/`backend.env` and rebuilds the frontend. In prod the equivalent step is a manual paste — see the [Production deployment](README.md#production-deployment) section of the README.

## Frontend ↔ backend routing

Frontend axios calls route through the **APIM gateway**, not directly to Laravel:

```
VITE_API_BASE_URL=https://services.app-uat.emis.moe.gov.lk/hrm/1.0.0
```

APIM strips the `/hrm/1.0.0` context and forwards to the backend's `/api/...` endpoint, passing the IS-issued Bearer token unchanged. Laravel's `JwtGuard` re-validates the JWT against IS's JWKS. This is the same in local and prod.

## Backend startup specifics

Backend is **FrankenPHP** (Caddy + PHP bundled), HTTP-only locally (`SERVER_NAME: ":80"` in the override) because the `nginx-proxy` handles TLS in front of it. In prod, TLS termination is handled by an external load balancer, not by FrankenPHP itself.
