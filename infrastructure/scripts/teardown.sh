#!/bin/bash

# EMIS local teardown script
# Removes the Docker stack and optionally leaves the swarm.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

STACK_NAME="${STACK_NAME:-emis-local}"

echo "WARNING: This will remove the '$STACK_NAME' Docker Swarm stack."
echo "         Databases and volumes will be destroyed."
read -rp "Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "Removing stack '$STACK_NAME'..."
docker stack rm "$STACK_NAME"

echo "Waiting for services to drain..."
sleep 10

echo "Pruning orphaned volumes..."
docker volume prune -f

echo "Teardown complete."
echo ""
echo "To also leave the Docker Swarm (optional):"
echo "  docker swarm leave --force"
