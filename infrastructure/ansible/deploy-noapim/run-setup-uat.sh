#!/bin/bash

# Exit immediately if any playbook fail.
set -e

#── Step 1: Pre-flight checks ─────────────────────────────────────────────────
ansible-playbook -i inventory/uat.yml -e @env/uat.yml playbooks/pre-check.yml

# ── Step 2: Install MySQL 8.0 ────────────────────────────────────────────────
ansible-playbook -i inventory/uat.yml -e @env/uat.yml playbooks/mysql-install.yml

# ── Step 3: Create EMIS application database and user ────────────────────────
ansible-playbook -i inventory/uat.yml -e @env/uat.yml playbooks/mysql-setup-emis-db.yml

# ── Step 4: Create WSO2 IS databases and import schemas ──────────────────────
ansible-playbook -i inventory/uat.yml -e @env/uat.yml playbooks/mysql-setup-wso2-is-only.yml

# ── Step 5: Render env files and deploy IS-only Docker stack ──────────────────
ansible-playbook -i inventory/uat.yml -e @env/uat.yml playbooks/deploy-is-only.yml

# ── Step 6: Configure IS (roles, users, OIDC apps) ───────────────────────────
ansible-playbook -i inventory/uat.yml -e @env/uat.yml playbooks/configure-is-only.yml

# ── Step 7: Deploy stack with updated credentials ────────────────────────────
ansible-playbook -i inventory/uat.yml -e @env/uat.yml playbooks/deploy-stack.yml

