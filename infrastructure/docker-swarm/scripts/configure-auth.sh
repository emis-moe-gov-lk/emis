#!/usr/bin/env bash
# Harvest OAuth credentials from local WSO2 IS and apply them to env files.
#
# Assumes configure-is-and-apim.yml has already been run (so the EMIS Web App
# and CEMIS-LK M2M applications exist in IS). Idempotent and re-runnable.
#
# Steps:
#   1. Sanity-check IS is reachable
#   2. Query IS for: SPA client_id (EMIS Web App), M2M client_id+secret
#      (CEMIS-LK M2M), Teacher role id
#   3. Write into frontend.env (VITE_ASGARDEO_CLIENT_ID) and backend.env
#      (ASGARDEO_CLIENT_ID, ASGARDEO_CLIENT_SECRET)
#   4. Rebuild frontend image (Vite bakes env at build time)
#   5. Restart backend container so it picks up the new env vars
#
# In prod swarm the equivalent of steps 2-3 is done manually: a human reads
# the credentials from the configure playbook's debug output, pastes them
# into infrastructure/ansible/vars.yml, then runs deploy-frontend.yml /
# deploy-backend.yml.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

IS_HOST="${IS_HOST:-idp.app-uat.emis.moe.gov.lk}"
IS_ADMIN_USER="${IS_ADMIN_USER:-admin}"
IS_ADMIN_PASS="${IS_ADMIN_PASS:-ADMIN11}"
FRONTEND_ENV="$DIR/frontend.env"
BACKEND_ENV="$DIR/backend.env"

is_curl() {
  curl -sk -u "${IS_ADMIN_USER}:${IS_ADMIN_PASS}" "$@"
}

# Idempotent: replace `KEY=...` line, or append if absent.
set_env_var() {
  local file="$1" key="$2" value="$3"
  if grep -qE "^${key}=" "$file"; then
    # Use | as sed delimiter so URLs / base64 with / don't trip it.
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

echo "==> Checking IS is reachable at https://${IS_HOST}"
if ! curl -sk -o /dev/null --max-time 5 "https://${IS_HOST}/oauth2/token/.well-known/openid-configuration"; then
  echo "ERROR: IS is not reachable at https://${IS_HOST}." >&2
  echo "Make sure the stack is up and the configure-is-and-apim playbook has run:" >&2
  echo "  cd ../ansible && ANSIBLE_CONFIG=/tmp/ansible-emis-local.cfg ansible-playbook \\" >&2
  echo "    -i inventory/local.yml playbooks/configure-is-and-apim.yml \\" >&2
  echo "    -e @resources/users-roles.yml -e ansible_become=false" >&2
  exit 1
fi

echo "==> Listing applications in IS"
APPS_JSON="$(is_curl "https://${IS_HOST}/api/server/v1/applications?limit=100")"

# Find the SPA application: name starts with admin_*_PRODUCTION, has
# publicClient=true and grantTypes=[authorization_code] in its OIDC config.
# (Two admin_*_PRODUCTION apps exist — one per APIM application — and we
# want the one for EMIS Web App, distinguished by publicClient+grant.)
echo "==> Looking up SPA client_id (EMIS Web App)"
SPA_CLIENT_ID=""
for app_id in $(echo "$APPS_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for app in data.get('applications', []):
    name = app.get('name', '')
    if name.startswith('admin_') and name.endswith('_PRODUCTION'):
        print(app['id'])
"); do
  oidc=$(is_curl "https://${IS_HOST}/api/server/v1/applications/${app_id}/inbound-protocols/oidc")
  match=$(echo "$oidc" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('publicClient') and 'authorization_code' in (d.get('grantTypes') or []):
    print(d.get('clientId'))
")
  if [[ -n "$match" ]]; then
    SPA_CLIENT_ID="$match"
    break
  fi
done

if [[ -z "$SPA_CLIENT_ID" ]]; then
  echo "ERROR: Could not find the EMIS Web App's OAuth client in IS." >&2
  echo "Has configure-is-and-apim.yml been run with -e @resources/users-roles.yml?" >&2
  exit 1
fi
echo "  SPA client_id: $SPA_CLIENT_ID"

echo "==> Looking up M2M credentials (CEMIS-LK M2M)"
M2M_APP_ID=$(echo "$APPS_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for app in data.get('applications', []):
    if app.get('name') == 'CEMIS-LK M2M':
        print(app['id']); break
")
if [[ -z "$M2M_APP_ID" ]]; then
  echo "ERROR: CEMIS-LK M2M application not found in IS." >&2
  exit 1
fi

M2M_OIDC=$(is_curl "https://${IS_HOST}/api/server/v1/applications/${M2M_APP_ID}/inbound-protocols/oidc")
M2M_CLIENT_ID=$(echo "$M2M_OIDC" | python3 -c "import json, sys; print(json.load(sys.stdin).get('clientId', ''))")
M2M_CLIENT_SECRET=$(echo "$M2M_OIDC" | python3 -c "import json, sys; print(json.load(sys.stdin).get('clientSecret', ''))")
if [[ -z "$M2M_CLIENT_ID" || -z "$M2M_CLIENT_SECRET" ]]; then
  echo "ERROR: M2M client_id or client_secret missing from IS response." >&2
  exit 1
fi
echo "  M2M client_id: $M2M_CLIENT_ID"
echo "  M2M client_secret: ${M2M_CLIENT_SECRET:0:4}... (masked)"

echo "==> Writing credentials into env files"
set_env_var "$FRONTEND_ENV" "VITE_ASGARDEO_CLIENT_ID" "$SPA_CLIENT_ID"
set_env_var "$BACKEND_ENV"  "ASGARDEO_CLIENT_ID"      "$M2M_CLIENT_ID"
set_env_var "$BACKEND_ENV"  "ASGARDEO_CLIENT_SECRET"  "$M2M_CLIENT_SECRET"
echo "  updated frontend.env: VITE_ASGARDEO_CLIENT_ID"
echo "  updated backend.env:  ASGARDEO_CLIENT_ID, ASGARDEO_CLIENT_SECRET"

echo "==> Rebuilding frontend image (Vite bakes VITE_* at build time)"
# rebuild.sh tails logs at the end which would block here; build + recreate manually.
cp .env.example .env
# Source frontend.env so VITE_* values land in the environment for compose's
# variable interpolation into the build's `args:` block.
set -a
# shellcheck disable=SC1090
source "$FRONTEND_ENV"
set +a
COMPOSE="docker compose -f docker-stack.yml -f docker-compose.local.yml"
$COMPOSE build frontend
$COMPOSE up -d --no-deps frontend

echo "==> Recreating backend so it picks up the new ASGARDEO_* env vars"
$COMPOSE up -d --no-deps --force-recreate backend
rm -f .env

cat <<EOF

==> Done.

  Frontend  https://app-uat.emis.moe.gov.lk
  Login as  teacher1 / Teacher@123  (or principal1 / Principal@123, dataentry1 / DataEntry@123)

The frontend bundle now has VITE_ASGARDEO_CLIENT_ID=$SPA_CLIENT_ID baked in.
The backend will use the M2M client above for SCIM2 provisioning.
EOF
