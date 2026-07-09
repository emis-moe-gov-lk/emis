#!/bin/bash

# Universal deployment script
# Auto-detects env, inventory, and stack files.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$SCRIPT_DIR/../ansible/deploy-setup"
ENV_DIR="$ANSIBLE_DIR/env"
INVENTORY_DIR="$ANSIBLE_DIR/inventory"
PB_DIR="$ANSIBLE_DIR/playbooks"

ENV_FILE="$ENV_DIR/env.yml"
INVENTORY_FILE="$INVENTORY_DIR/inventory.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: env.yml not found in $ENV_DIR"
  exit 1
fi

if [ ! -f "$INVENTORY_FILE" ]; then
  echo "Error: inventory.yml not found in $INVENTORY_DIR"
  exit 1
fi

ENV=$(basename "$ENV_FILE" .yml)

echo "Using env: $ENV_FILE"
echo "Using inventory: $INVENTORY_FILE"
echo "Starting deployment to $ENV..."

#── Step 1: Pre-flight checks ─────────────────────────────────────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/pre-check.yml"

# ── Step 2: Install MySQL 8.0 ────────────────────────────────────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-install.yml"

# ── Step 3: Create EMIS application database and user ────────────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-setup-emis-db.yml"

# ── Step 4: Create WSO2 IS databases and import schemas ──────────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-setup-wso2-is-only.yml"

# ── Step 5: Create WSO2 APIM databases ──────────────────────────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-setup-wso2-apim.yml"

# ── Step 7: Render env files and deploy IS-only Docker stack ──────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/deploy-is-only.yml"

# ── Step 8: Configure IS (roles, users, OIDC apps) ───────────────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/configure-is-only.yml"

# ── Step 9: Deploy stack with updated credentials ────────────────────────────
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/deploy-stack.yml"

echo "Deployment to $ENV finished successfully."
