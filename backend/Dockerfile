FROM dunglas/frankenphp:1-php8.4

# Set environment variables for production/non-interactive builds
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies & utility tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Use the official FrankenPHP/docker-php-extension-installer script
RUN curl -sSL https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions \
    -o /usr/local/bin/install-php-extensions \
    && chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        opcache \
        intl

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory to FrankenPHP's default webroot
WORKDIR /app

# Copy composer files first to leverage Docker layer caching
COPY composer.json composer.lock ./

RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts

# Copy Caddyfile to container
COPY docker/Caddyfile /etc/caddy/Caddyfile

# Copy the rest of the application source code
COPY . .

# Adjust permissions for the webserver user (www-data) to write to required directories.
# (If using Laravel, keep storage/bootstrap; otherwise adjust these paths to match your framework's writable directories)
RUN if [ -d "storage" ] && [ -d "bootstrap/cache" ]; then \
        chown -R www-data:www-data storage bootstrap/cache && \
        chmod -R 775 storage bootstrap/cache; \
    fi

# FrankenPHP serves HTTP directly on port 80 by default (or 443 for HTTPS)
EXPOSE 80
EXPOSE 443

# Start FrankenPHP server in standard mode
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
