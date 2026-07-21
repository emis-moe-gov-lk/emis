#!/bin/bash

# EMIS local deployment script
# Single-machine Docker Swarm setup — no jumpbox, no remote hosts.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$SCRIPT_DIR/../ansible/deploy-setup"
ENV_DIR="$ANSIBLE_DIR/env"
INVENTORY_DIR="$ANSIBLE_DIR/inventory"
PB_DIR="$ANSIBLE_DIR/playbooks"

export ANSIBLE_CONFIG="$ANSIBLE_DIR/ansible.cfg"

ENV_FILE="$ENV_DIR/env-local.yml"
INVENTORY_FILE="$INVENTORY_DIR/inventory-local.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: env-local.yml not found in $ENV_DIR"
  echo "Copy env-local.yml.example and fill in your values."
  exit 1
fi

if [ ! -f "$INVENTORY_FILE" ]; then
  echo "Error: inventory-local.yml not found in $INVENTORY_DIR"
  exit 1
fi

# Check docker-swarm env files exist (copy from .example if missing)
SWARM_DIR="$SCRIPT_DIR/../docker-swarm"
MISSING=""
for f in .env is.env apim.env backend.env frontend.env; do
  [ -f "$SWARM_DIR/$f" ] || MISSING="$MISSING  $f\n"
done
if [ -n "$MISSING" ]; then
  echo "Missing docker-swarm env files:"
  printf "%b" "$MISSING"
  echo "Run: cd $SWARM_DIR && cp env.example .env && cp is.env.example is.env && cp apim.env.example apim.env && cp backend.env.example backend.env && cp frontend.env.example frontend.env"
  exit 1
fi

echo "Using env:     $ENV_FILE"
echo "Using inventory: $INVENTORY_FILE"
echo "Starting local deployment..."

# -- Step 1: Pre-flight checks (Docker, Swarm, ports) --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" "$PB_DIR/pre-check.yml"

# -- Step 2: Deploy full stack (MySQL, IS, APIM, frontend, backend) --
#    MySQL auto-creates databases via init scripts on first start.
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" "$PB_DIR/deploy-stack.yml"

# -- Step 3: Configure IS (roles, users, OIDC apps) --
#    Credentials are written back to docker-swarm/backend.env and frontend.env.
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" "$PB_DIR/configure-is.yml"

# -- Step 4: Configure APIM (register IS as Key Manager, create DevPortal app shells) --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" "$PB_DIR/configure-apim-km-apps.yml"

# -- Step 5: Redeploy stack (picks up updated M2M creds from docker-swarm/) --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" "$PB_DIR/deploy-stack.yml"

# -- Step 6: Configure APIM (API import, subscriptions, keys, DCR sync) --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" "$PB_DIR/configure-apim-apis-appsub.yml"

echo "Local deployment finished successfully."
