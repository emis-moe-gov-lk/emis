#!/usr/bin/env bash
# ============================================================
# EMIS No-APIM — local deployment runner
# ============================================================
# Runs playbooks/site-local.yml as root so the playbooks'
# `become: true` needs no password prompt (no -K).
#
# Usage:
#   sudo bash infrastructure/ansible/deploy-noapim/scripts/run-site-local.sh
#
# Optionally pass a different playbook to run with the same
# inventory/env (e.g. re-render after pasting credentials):
#   sudo bash .../run-site-local.sh deploy-stack.yml
# ============================================================
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo bash $0" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"   # infrastructure/ansible
PLAYBOOK="${1:-site-local.yml}"

# Minimal config — the project ansible.cfg references a removed
# callback plugin and a .vault_pass file that doesn't exist locally.
CFG=/tmp/ansible-emis-local.cfg
if [[ ! -f "$CFG" ]]; then
  printf '[defaults]\nstdout_callback = default\n' > "$CFG"
fi

cd "$ANSIBLE_DIR"
ANSIBLE_CONFIG="$CFG" exec ansible-playbook \
  "deploy-noapim/playbooks/${PLAYBOOK}" \
  -i deploy-noapim/inventory/local.yml \
  -e @deploy-noapim/env/local.yml \
  -e target_hosts=all
