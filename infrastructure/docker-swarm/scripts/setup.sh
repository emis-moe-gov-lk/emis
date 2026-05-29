#!/usr/bin/env bash
#
# Local Development Setup
# =======================
# One-shot bootstrap that brings up the full EMIS stack locally.
# Safe to re-run — each step is idempotent.
#
# What it does (in order):
#   1. Copy .env.example files → .env (if not already present)
#   2. Generate a self-signed TLS certificate for the local nginx-proxy
#   3. Copy that cert into APIM/IS build contexts so they trust local TLS
#   4. Build all Docker images (frontend, backend, wso2-is, wso2-apim)
#   5. Start MySQL and wait for it to be healthy
#   6. Seed WSO2 databases (shared_db, apim_db, identity_db) via Ansible
#   7. Start all remaining services (IS, APIM, backend, frontend, nginx-proxy)
#   8. Wait for WSO2 IS and APIM to finish booting (~2 min each)
#   9. Recreate nginx-proxy so it picks up current container IPs
#  10. Wait for backend to finish migrations (~1-2 min)
#  11. Configure IS + APIM (Key Manager, roles, users, APIs, applications)
#  12. Harvest OAuth credentials into env files and rebuild frontend
#
# Prerequisites:
#   - Docker & Docker Compose
#   - Ansible (pip install ansible)
#   - /etc/hosts entries (printed at the end if missing)
#
# To run individual steps manually, search for "Step N" below.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANSIBLE_DIR="$(cd "$DIR/../ansible" && pwd)"
cd "$DIR"

COMPOSE="docker compose -f docker-stack.yml -f docker-compose.local.yml"

copy_if_missing() {
  local target="$1"
  local example="${target}.example"
  if [[ ! -f "$target" ]]; then
    if [[ -f "$example" ]]; then
      cp "$example" "$target"
      echo "  created $target from $example"
    else
      echo "  WARN: $target missing and no $example to copy from" >&2
    fi
  fi
}

# ---------------------------------------------------------------------------
# Step 1: Ensure env files exist
# ---------------------------------------------------------------------------
# Each service reads from its own .env file. The *.env.example files are
# committed to git; real *.env files are gitignored. This copies the examples
# into place on first run so docker compose can interpolate them.
echo "==> Step 1: Ensuring env files exist"
copy_if_missing .env
copy_if_missing apim.env
copy_if_missing backend.env
copy_if_missing frontend.env
copy_if_missing is.env

# ---------------------------------------------------------------------------
# Step 2: Generate self-signed TLS certificate
# ---------------------------------------------------------------------------
# The nginx-proxy terminates TLS locally using this cert. It covers all the
# UAT-mirror hostnames (app-uat, api-uat, idp, apim, services).
echo "==> Step 2: Generating self-signed TLS cert for nginx-proxy (if missing)"
CERT_DIR="$DIR/nginx-proxy/certs"
mkdir -p "$CERT_DIR"
if [[ ! -s "$CERT_DIR/cert.pem" || ! -s "$CERT_DIR/key.pem" ]]; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
    -keyout "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" \
    -subj "/CN=app-uat.emis.moe.gov.lk" \
    -addext "subjectAltName=DNS:app-uat.emis.moe.gov.lk,DNS:api-uat.emis.moe.gov.lk,DNS:idp.app-uat.emis.moe.gov.lk,DNS:apim.app-uat.emis.moe.gov.lk,DNS:services.app-uat.emis.moe.gov.lk" \
    2>/dev/null
  echo "  cert + key written to $CERT_DIR"
fi

# ---------------------------------------------------------------------------
# Step 3: Copy TLS cert into APIM/IS build contexts
# ---------------------------------------------------------------------------
# APIM and IS Dockerfiles import any .pem in their certs/ dir into the Java
# truststore at build time. This lets them trust our local nginx-proxy TLS
# when calling each other through the proxy.
echo "==> Step 3: Seeding WSO2 image build contexts with the proxy cert"
cp "$CERT_DIR/cert.pem" "$DIR/../../apim/certs/cert.pem"
cp "$CERT_DIR/cert.pem" "$DIR/../../is/certs/cert.pem"

# ---------------------------------------------------------------------------
# Step 4: Build all Docker images
# ---------------------------------------------------------------------------
# First run pulls base images and compiles everything — expect 10-20 min.
# Subsequent runs are mostly cached and much faster.
echo "==> Step 4: Building images (this can take 10-20 min on first run)"
$COMPOSE build

# ---------------------------------------------------------------------------
# Step 5: Start MySQL and wait for it to be healthy
# ---------------------------------------------------------------------------
# MySQL must be up before we can seed the WSO2 databases in step 6.
echo "==> Step 5: Starting mysql"
$COMPOSE up -d mysql

echo "    Waiting for mysql healthcheck..."
for _ in {1..60}; do
  health=$(docker inspect --format '{{.State.Health.Status}}' docker-swarm-mysql-1 2>/dev/null || echo "starting")
  [[ "$health" == "healthy" ]] && break
  sleep 2
done
if [[ "$health" != "healthy" ]]; then
  echo "ERROR: mysql did not become healthy in time" >&2
  exit 1
fi
echo "    mysql is healthy"

# ---------------------------------------------------------------------------
# Step 6: Seed WSO2 databases via Ansible
# ---------------------------------------------------------------------------
# Runs the mysql-setup-wso2 playbook against the local MySQL container
# (exposed on localhost:3308). Creates the shared_db, apim_db, identity_db
# databases and the wso2-user account that IS/APIM connect with.
#
# Manual equivalent:
#   cd infrastructure/ansible
#   ANSIBLE_CONFIG=/tmp/ansible-emis-local.cfg ansible-playbook \
#     -i inventory/local.yml playbooks/mysql-setup-wso2.yml \
#     --start-at-task="Create a temporary directory on the remote host" \
#     -e ansible_become=false \
#     -e varsfl_mysql_host=127.0.0.1 -e varsfl_mysql_port=3308 \
#     -e varsfl_mysql_root_user=root -e varsfl_mysql_root_password=root \
#     -e varsfl_mysql_user_configured=wso2-user \
#     -e varsfl_mysql_user_configured_password=WSO2@User4
echo "==> Step 6: Seeding WSO2 databases via Ansible"

# Create stub files that the playbook expects (real values are passed via -e).
[[ -f "$ANSIBLE_DIR/vars.yml" ]] || echo "# stub for local dev" > "$ANSIBLE_DIR/vars.yml"
[[ -s "$ANSIBLE_DIR/.vault_pass" ]] || echo "dummy" > "$ANSIBLE_DIR/.vault_pass"
if [[ ! -f "$ANSIBLE_DIR/inventory/local.yml" ]]; then
  cat > "$ANSIBLE_DIR/inventory/local.yml" <<'INV'
# Local-dev inventory: targets the docker mysql container exposed on localhost:3308.
all:
  vars:
    ansible_connection: local
    ansible_python_interpreter: /usr/bin/python3
  children:
    databases:
      hosts:
        local_db:
          ansible_host: 127.0.0.1
INV
fi

# The project's ansible.cfg references a removed callback plugin.
# Use a minimal local config to avoid the error.
LOCAL_ANSIBLE_CFG="/tmp/ansible-emis-local.cfg"
cat > "$LOCAL_ANSIBLE_CFG" <<'CFG'
[defaults]
stdout_callback = default
host_key_checking = False
CFG

(
  cd "$ANSIBLE_DIR"
  ANSIBLE_CONFIG="$LOCAL_ANSIBLE_CFG" ansible-playbook \
    -i inventory/local.yml \
    playbooks/mysql-setup-wso2.yml \
    --start-at-task="Create a temporary directory on the remote host" \
    -e ansible_become=false \
    -e varsfl_mysql_host=127.0.0.1 \
    -e varsfl_mysql_port=3308 \
    -e varsfl_mysql_root_user=root \
    -e varsfl_mysql_root_password=root \
    -e varsfl_mysql_user_configured=wso2-user \
    -e varsfl_mysql_user_configured_password=WSO2@User4
)

# ---------------------------------------------------------------------------
# Step 7: Start all remaining services
# ---------------------------------------------------------------------------
# Brings up wso2-is, wso2-apim, backend, frontend, and nginx-proxy.
# IS and APIM take ~2 min to fully boot after the container starts.
echo "==> Step 7: Starting remaining services"
$COMPOSE up -d

# ---------------------------------------------------------------------------
# Step 8: Wait for WSO2 IS + APIM to finish booting
# ---------------------------------------------------------------------------
# Polls each service's carbon login page on its direct host port (bypassing
# nginx-proxy). A 200 means the WSO2 carbon server has fully started.
echo "==> Step 8: Waiting for WSO2 IS + APIM to finish booting (~2 min each)"
for svc in "wso2-is:9444" "wso2-apim:9443"; do
  name="${svc%%:*}"
  port="${svc##*:}"
  printf "    %-12s " "$name"
  for _ in {1..120}; do
    code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 3 "https://localhost:${port}/carbon/admin/login.jsp" || true)
    if [[ "$code" == "200" ]]; then
      echo "ready"
      break
    fi
    sleep 2
  done
  if [[ "$code" != "200" ]]; then
    echo "FAILED (last HTTP: $code)" >&2
    exit 1
  fi
done

# ---------------------------------------------------------------------------
# Step 9: Recreate nginx-proxy
# ---------------------------------------------------------------------------
# nginx resolves upstream hostnames (wso2-is, wso2-apim, frontend, backend)
# once at startup and caches the IPs forever. If nginx-proxy was already
# running from a previous session, it will have stale IPs for the freshly
# started containers. Force-recreating it picks up the current IPs.
echo "==> Step 9: Recreating nginx-proxy so it resolves current container IPs"
$COMPOSE up -d --force-recreate nginx-proxy

# ---------------------------------------------------------------------------
# Step 10: Wait for backend to be ready
# ---------------------------------------------------------------------------
# The backend runs `php artisan migrate:fresh --seed --force` on every start,
# which takes 1-2 min. APIM needs to fetch the OpenAPI spec from the backend
# in step 11, so we must wait for it to finish migrations first.
echo "==> Step 10: Waiting for backend to finish migrations"
printf "    backend      "
for _ in {1..120}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:9000" || true)
  if [[ "$code" == "404" || "$code" == "200" ]]; then
    echo "ready"
    break
  fi
  sleep 3
done
if [[ "$code" != "404" && "$code" != "200" ]]; then
  echo "FAILED (last HTTP: $code)" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Step 11: Configure IS + APIM via Ansible
# ---------------------------------------------------------------------------
# Registers IS as Key Manager in APIM, creates roles/users, imports the API
# from the backend's OpenAPI spec, creates APIM applications, and sets up
# OAuth clients in IS.
#
# Manual equivalent:
#   cd infrastructure/ansible
#   ANSIBLE_CONFIG=/tmp/ansible-emis-local.cfg ansible-playbook \
#     -i inventory/local.yml playbooks/configure-is-and-apim.yml \
#     -e @resources/users-roles.yml -e ansible_become=false
echo "==> Step 11: Configuring IS + APIM (Key Manager, roles, users, APIs, apps)"
(
  cd "$ANSIBLE_DIR"
  ANSIBLE_CONFIG="$LOCAL_ANSIBLE_CFG" ansible-playbook \
    -i inventory/local.yml \
    playbooks/configure-is-and-apim.yml \
    -e @resources/users-roles.yml \
    -e ansible_become=false
)

# ---------------------------------------------------------------------------
# Step 12: Harvest OAuth credentials and rebuild frontend
# ---------------------------------------------------------------------------
# Reads the OAuth client_id/secret created in step 11 from IS, writes them
# into frontend.env and backend.env, rebuilds the frontend image (VITE_*
# values are baked at build time), and restarts the backend.
echo "==> Step 12: Harvesting OAuth credentials + rebuilding frontend"
"$DIR/scripts/configure-auth.sh"

# ---------------------------------------------------------------------------
# Done — print status and access info
# ---------------------------------------------------------------------------
echo "==> Status"
$COMPOSE ps

cat <<EOF

============================================================
  Local stack is ready!
============================================================

Add these lines to /etc/hosts (if not already present):

  127.0.0.1 app-uat.emis.moe.gov.lk
  127.0.0.1 api-uat.emis.moe.gov.lk
  127.0.0.1 idp.app-uat.emis.moe.gov.lk
  127.0.0.1 apim.app-uat.emis.moe.gov.lk
  127.0.0.1 services.app-uat.emis.moe.gov.lk

Access via (browser will warn about the self-signed cert):

  Frontend      https://app-uat.emis.moe.gov.lk
  Backend API   https://api-uat.emis.moe.gov.lk
  WSO2 IS       https://idp.app-uat.emis.moe.gov.lk/carbon
  WSO2 APIM     https://apim.app-uat.emis.moe.gov.lk/carbon
  APIM Gateway  https://services.app-uat.emis.moe.gov.lk

Direct ports (for debugging, bypasses nginx-proxy):

  Backend       http://localhost:9000
  WSO2 IS       https://localhost:9444/carbon
  WSO2 APIM     https://localhost:9443/carbon
  MySQL         localhost:3308  (root/root admin, emis/emis app)

Common commands:

  Tail logs:    $COMPOSE logs -f [service]
  Stop stack:   $COMPOSE down
  Rebuild one:  ./scripts/rebuild.sh backend|frontend|wso2-is|wso2-apim
EOF
