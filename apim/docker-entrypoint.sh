#!/bin/bash
set -e

ARGS=("$@")
if [ "${APIM_SETUP_MODE}" = "true" ]; then
  ARGS+=("-Dsetup")
fi

if [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}" ] && [ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}" ]; then
  export INFISICAL_TOKEN=$(infisical login \
    --method=universal-auth \
    --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
    --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
    --silent --plain)

  exec infisical run \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    -- "${ARGS[@]}"
else
  exec "${ARGS[@]}"
fi
