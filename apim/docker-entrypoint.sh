#!/bin/bash
set -e

ARGS=("$@")
if [ "${APIM_SETUP_MODE}" = "true" ]; then
  ARGS+=("-Dsetup")
fi

exec infisical run \
  --clientId "$INFISICAL_CLIENT_ID" \
  --clientSecret "$INFISICAL_CLIENT_SECRET" \
  --projectId "$INFISICAL_PROJECT_ID" \
  --env "$INFISICAL_ENV" \
  -- "${ARGS[@]}"
