#!/bin/bash

# Universal teardown script
# Usage: ./teardown.sh <env>
# Example: ./teardown.sh uat

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

echo "Starting teardown of $ENV..."

ansible-playbook -i inventory/$ENV.yml -e @env/$ENV.yml -e deploy_env=$ENV ../teardown/site-teardown.yml

echo "Teardown of $ENV finished."
