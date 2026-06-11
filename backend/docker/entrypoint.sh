#!/bin/sh
set -e

# Extract hostname from APP_URL for Caddy (e.g., http://api.example.com -> api.example.com)
if [ -n "$APP_URL" ]; then
    export SERVER_NAME=$(echo "$APP_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
    echo "==> Setting SERVER_NAME to: $SERVER_NAME"
fi

echo "==> Installing Composer dependencies..."
composer install --no-interaction --optimize-autoloader --no-scripts
php artisan package:discover --ansi || true

echo "==> Setting storage permissions..."
find storage bootstrap/cache -type d -exec chown www-data:www-data {} \;
find storage bootstrap/cache -type d -exec chmod 775 {} \;

echo "==> Generating application key (if not set)..."
php artisan key:generate --no-interaction --force 2>/dev/null || true

echo "==> Running database migrations..."
php artisan migrate --force --no-interaction

echo "==> Linking storage..."
php artisan storage:link --force

echo "==> Clearing caches..."
php artisan config:clear
php artisan route:clear

echo "==> Starting FrankenPHP..."
exec frankenphp run --config /etc/caddy/Caddyfile
