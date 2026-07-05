#!/bin/bash

# Universal teardown script
# Auto-detects env and inventory files.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$SCRIPT_DIR/../ansible"
ENV_DIR="$ANSIBLE_DIR/deploy-setup/env"
INVENTORY_DIR="$ANSIBLE_DIR/deploy-setup/inventory"
TEARDOWN_PB="$ANSIBLE_DIR/teardown/site-teardown.yml"

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

echo "Starting teardown..."
ansible-playbook -i "$INVENTORY_FILE" -e @"$ENV_FILE" -e deploy_env="$ENV" "$TEARDOWN_PB"
echo "Teardown finished."
