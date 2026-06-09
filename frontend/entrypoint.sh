#!/bin/sh
# Generate env-config.js from the template, substituting env vars
envsubst < /usr/share/nginx/html/env-config.js.template > /usr/share/nginx/html/env-config.js
# Start Nginx
exec nginx -g "daemon off;"
