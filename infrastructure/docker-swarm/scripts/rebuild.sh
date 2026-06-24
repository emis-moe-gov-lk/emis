#!/usr/bin/env bash
# Rebuild one (or all) services after a source change and restart it.
# Usage: ./rebuild.sh backend|frontend|wso2-is|wso2-apim|all

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

COMPOSE="docker compose -f docker-stack.yml -f docker-compose.local.yml"

service="${1:-}"

case "$service" in
  backend|frontend|wso2-is|wso2-apim)
    ;;
  all)
    echo "==> Rebuilding all services"
    $COMPOSE build
    $COMPOSE up -d
    $COMPOSE ps
    exit 0
    ;;
  "")
    echo "Usage: $0 backend|frontend|wso2-is|wso2-apim|all" >&2
    exit 1
    ;;
  *)
    echo "Unknown service: $service" >&2
    echo "Usage: $0 backend|frontend|wso2-is|wso2-apim|all" >&2
    exit 1
    ;;
esac

# For the frontend, source frontend.env so VITE_* values are in scope for
# compose's `args:` interpolation (Vite bakes them at build time).
if [[ "$service" == "frontend" && -f frontend.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source frontend.env
  set +a
fi

echo "==> Rebuilding $service"
$COMPOSE build "$service"

echo "==> Restarting $service"
$COMPOSE up -d --no-deps "$service"

echo "==> Tailing logs for $service (Ctrl-C to exit)"
$COMPOSE logs -f "$service"
