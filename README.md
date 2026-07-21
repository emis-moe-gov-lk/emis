# EMIS — Education Management Information System

> **Branch:** `infra/setup/v2-local` — Local single-machine deployment with full APIM-integrated stack (v2)

A comprehensive Education Management Information System with a React frontend, Laravel REST API backend, and WSO2 Identity Server (IS) + API Manager (APIM) for authentication, authorization, and API gateway management. This branch deploys all five components locally via Docker Swarm — no jumpbox, no remote hosts.

## Architecture

| Component    | Technology                | Role                                      | Local Port      |
|-------------|--------------------------|-------------------------------------------|-----------------|
| Frontend     | React (Vite)              | User-facing SPA                           | 80              |
| Backend      | Laravel + FrankenPHP/Caddy | REST API + PHP backend                    | 9000            |
| WSO2 IS      | WSO2 Identity Server 7.2.0 | Authentication (OIDC), user/role management | 9444            |
| WSO2 APIM    | WSO2 API Manager 4.6.0    | API gateway, key management, developer portal | 9443 / 8243 / 8280 |
| MySQL        | MySQL 8.0                 | Shared database for all services          | 3306 (internal) |

## Prerequisites

- **Docker** 20.10+ with Swarm mode initialized (`docker swarm init`)
- **Ansible** (for `deploy.sh` orchestration)
- **sudo** access (playbooks use `become: yes` for privileged tasks)
- ~4 GB free disk space for Docker images

## Quickstart

```bash
# 1. Clone and checkout
git clone <repo-url> emis
cd emis
git checkout infra/setup/v2-local

# 2. Build all Docker images
docker build -t emis-backend:local backend/
docker build -t emis-frontend:local frontend/
docker build -t emis-is:local is/
docker build -t emis-apim:local apim/

# 3. Set up docker-swarm env files
cd infrastructure/docker-swarm
cp env.example .env
cp is.env.example is.env
cp apim.env.example apim.env
cp backend.env.example backend.env
cp frontend.env.example frontend.env
# Optional: edit .env to set MySQL passwords (defaults are "changeme")

# 4. (One-time) Ensure env-local.yml exists
# Already present in ansible/deploy-setup/env/env-local.yml
# Edit if you need custom ports or credentials

# 5. Deploy
cd ../scripts && ./deploy.sh

# 6. Verify
docker service ls                                  # all services should show 1/1 replicas
curl http://localhost:9000/api.json                # backend health
curl -k https://localhost:9443/api/health-check/v1.0/health   # APIM health
```

**Notes:**
- The MySQL image is pulled automatically by Docker Swarm (not built from source).
- `deploy.sh` prompts for your sudo password once at the start and caches it.
- Start-to-finish takes ~5–8 minutes (image builds + WSO2 startup latency).
- The deployment runs Ansible playbooks sequentially: pre-check → deploy stack → configure IS → configure APIM → redeploy → finalize APIM.

## Directory Structure

```
├── backend/              # Laravel 12 REST API
├── frontend/             # React SPA (Vite)
├── is/                   # WSO2 Identity Server (Dockerfile + config)
├── apim/                 # WSO2 API Manager (Dockerfile + config)
├── infrastructure/       # All deployment configs and IaC
│   ├── docker-swarm/             # Stack YAMLs + env files
│   │   ├── docker-stack.yml      # Full 5-service stack
│   │   └── *.env.example         # Env file templates
│   ├── ansible/deploy-setup/     # Playbooks + inventory + templates
│   └── scripts/
│       ├── deploy.sh             # Local deployment (single machine)
│       ├── deployv2.sh           # Multi-host remote deployment
│       └── teardown.sh           # Destroy local stack
├── docs/                 # Runbooks, architecture docs, incidents
└── .devcontainer/        # VS Code remote dev container
```

## Teardown

```bash
./infrastructure/scripts/teardown.sh
```

This removes the EMIS Docker Swarm stack and prunes orphaned volumes.

## Useful Commands

```bash
docker service ls                              # check service health
docker service logs -f emis-local_backend      # live backend logs
docker service logs -f emis-local_wso2-is      # live IS logs
docker stack ps emis-local                     # individual task status
```

## Links

- [Backend Architecture](docs/backend/ARCHITECTURE.md)
- [Running Backend Locally (standalone)](docs/runbooks/run-backend-locally.md)
- [Infrastructure Agent Instructions](infrastructure/AGENTS.md)
- [Branch Naming Convention](docs/repo/branch-naming-convention.md)
