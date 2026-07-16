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

# -- Step 1: Pre-flight checks --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/pre-check.yml"

# -- Step 2: Install MySQL 8.0 --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-install.yml"

# -- Step 3: Create EMIS application database and user --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-setup-emis-db.yml"

# -- Step 4: Create WSO2 IS databases and import schemas --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-setup-wso2-is-only.yml"

# -- Step 5: Create WSO2 APIM databases (APIM-integrated envs only) --
if grep -q "^mysql_apim_db:" "$ENV_FILE"; then
  ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/mysql-setup-wso2-apim.yml"
else
  echo "Skipping Step 5: APIM database setup (mysql_apim_db not defined in env)"
fi

# -- Step 6: Render env files and deploy IS+APIM Docker stack --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/deploy-is-apim.yml"

# -- Step 7: Configure APIM (KM registration + DevPortal app shells) --
if grep -q "^mysql_apim_db:" "$ENV_FILE"; then
  ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/configure-apim.yml"
else
  echo "Skipping Step 7: APIM configuration (mysql_apim_db not defined in env)"
fi

# -- Step 8: Configure IS (roles, users, OIDC apps) --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/configure-is.yml"

# -- Step 9: Deploy full stack (IS + APIM + frontend + backend) --
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/deploy-stack.yml"

# -- Step 10: Configure APIM (API import, subscriptions, keys, DCR sync) --
if grep -q "^mysql_apim_db:" "$ENV_FILE"; then
  ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$PB_DIR/configure-apim-apis-appsub.yml"
else
  echo "Skipping Step 10: APIM API import and subscriptions (mysql_apim_db not defined in env)"
fi

echo "Deployment to $ENV finished successfully."
