#!/usr/bin/env bash
# One-shot local bootstrap: copies env examples if missing, builds all images,
# seeds WSO2 databases via the ansible playbook, and starts the full stack.

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

echo "==> Ensuring env files exist"
copy_if_missing .env
copy_if_missing apim.env
copy_if_missing backend.env
copy_if_missing frontend.env
copy_if_missing is.env

echo "==> Generating self-signed TLS cert for nginx-proxy (if missing)"
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

echo "==> Seeding WSO2 image build contexts with the proxy cert"
# APIM and IS Dockerfiles import any .pem files found in their certs/ dir into
# the WSO2 client-truststore at build time. Copy the proxy cert there so the
# baked images trust our local TLS when calling each other through the proxy.
cp "$CERT_DIR/cert.pem" "$DIR/../../apim/certs/cert.pem"
cp "$CERT_DIR/cert.pem" "$DIR/../../is/certs/cert.pem"

echo "==> Building images (this can take 10-20 min on first run)"
$COMPOSE build

echo "==> Starting mysql (alone) so WSO2 DBs can be seeded"
$COMPOSE up -d mysql

echo "==> Waiting for mysql healthcheck"
for _ in {1..60}; do
  health=$(docker inspect --format '{{.State.Health.Status}}' docker-swarm-mysql-1 2>/dev/null || echo "starting")
  [[ "$health" == "healthy" ]] && break
  sleep 2
done
if [[ "$health" != "healthy" ]]; then
  echo "ERROR: mysql did not become healthy in time" >&2
  exit 1
fi
echo "  mysql is healthy"

echo "==> Seeding WSO2 databases via ansible playbook"
# The ansible playbook expects these auxiliary files. Create stubs if missing —
# real values are passed via -e on the command line, so vars.yml stays empty.
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

# The project's ansible.cfg references a stdout callback removed in modern ansible.
# Bypass with a minimal local cfg.
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

echo "==> Starting remaining services"
$COMPOSE up -d

echo "==> Waiting for WSO2 IS + APIM to finish booting (~2 min)"
# /carbon returns 200 once the carbon server has fully started.
for svc in "wso2-is:9444" "wso2-apim:9443"; do
  name="${svc%%:*}"
  port="${svc##*:}"
  printf "  %-12s " "$name"
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

echo "==> Configuring IS + APIM (Key Manager, roles, users, APIs, applications)"
(
  cd "$ANSIBLE_DIR"
  ANSIBLE_CONFIG="$LOCAL_ANSIBLE_CFG" ansible-playbook \
    -i inventory/local.yml \
    playbooks/configure-is-and-apim.yml \
    -e @resources/users-roles.yml \
    -e ansible_become=false
)

echo "==> Harvesting OAuth credentials into env files + rebuilding frontend"
"$DIR/scripts/configure-auth.sh"

echo "==> Status"
$COMPOSE ps

cat <<EOF

Local stack is up. WSO2 IS/APIM take ~100-125 sec each to fully boot — give them
a minute before hitting the consoles.

Add these lines to /etc/hosts so the UAT-mirror hostnames resolve locally:

  127.0.0.1 app-uat.emis.moe.gov.lk
  127.0.0.1 api-uat.emis.moe.gov.lk
  127.0.0.1 idp.app-uat.emis.moe.gov.lk
  127.0.0.1 apim.app-uat.emis.moe.gov.lk
  127.0.0.1 services.app-uat.emis.moe.gov.lk

Once added, access via:

  Frontend      https://app-uat.emis.moe.gov.lk
  Backend       https://api-uat.emis.moe.gov.lk
  WSO2 IS       https://idp.app-uat.emis.moe.gov.lk/carbon
  WSO2 APIM     https://apim.app-uat.emis.moe.gov.lk/carbon
  APIM Gateway  https://services.app-uat.emis.moe.gov.lk

(Browser will warn about the self-signed cert; accept once per host.)

Direct ports also still work for debugging:
  Backend       http://localhost:9000
  WSO2 IS       https://localhost:9444/carbon
  WSO2 APIM     https://localhost:9443/carbon
  MySQL         localhost:3308  (root/root for admin, emis/emis for the app)

Tail logs:    $COMPOSE logs -f [service]
Stop stack:   $COMPOSE down
Rebuild one:  ./scripts/rebuild.sh backend|frontend|wso2-is|wso2-apim
EOF
