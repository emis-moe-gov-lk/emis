#!/bin/bash

# Universal deployment script
# Usage: ./deploy.sh <env>
# Example: ./deploy.sh uat

# Exit immediately if any playbook fails.
set -e

if [ -z "$1" ]; then
  echo "Error: No environment specified."
  echo "Usage: $0 <env> (e.g., uat, prod)"
  exit 1
fi

ENV=$1

if [ ! -f "env/$ENV.yml" ]; then
  echo "Error: env/$ENV.yml does not exist."
  exit 1
fi

if [ ! -f "inventory/$ENV.yml" ]; then
  echo "Error: inventory/$ENV.yml does not exist."
  exit 1
fi

# Define playbook directory
PB_DIR="playbooks"

echo "Starting deployment to $ENV..."

#── Step 1: Pre-flight checks ─────────────────────────────────────────────────
ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV $PB_DIR/pre-check.yml

# ── Step 2: Install MySQL 8.0 ────────────────────────────────────────────────
ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV $PB_DIR/mysql-install.yml

# ── Step 3: Create EMIS application database and user ────────────────────────
ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV $PB_DIR/mysql-setup-emis-db.yml

# ── Step 4: Create WSO2 IS databases and import schemas ──────────────────────
ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV $PB_DIR/mysql-setup-wso2-is-only.yml

# ── Step 5: Render env files and deploy IS-only Docker stack ──────────────────
ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV $PB_DIR/deploy-is-only.yml

# ── Step 6: Configure IS (roles, users, OIDC apps) ───────────────────────────
ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV $PB_DIR/configure-is-only.yml

# ── Step 7: Deploy stack with updated credentials ────────────────────────────
ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV $PB_DIR/deploy-stack.yml

echo "Deployment to $ENV finished successfully."
