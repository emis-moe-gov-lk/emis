#!/bin/bash
set -e

echo 'Waiting for MySQL...'
until echo > /dev/tcp/mysql/3306 2>/dev/null; do sleep 5; done
echo 'MySQL is ready'

echo 'Waiting for WSO2 IS...'
until echo > /dev/tcp/wso2-is/9444 2>/dev/null; do sleep 5; done
echo 'WSO2 IS is ready'

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
