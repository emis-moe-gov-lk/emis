#!/bin/bash
set -e

ARGS=("$@")
if [ "${APIM_SETUP_MODE}" = "true" ]; then
  ARGS+=("-Dsetup")
fi

exec infisical run \
  --project-id "$INFISICAL_PROJECT_ID" \
  --env "$INFISICAL_ENV" \
  -- "${ARGS[@]}"
