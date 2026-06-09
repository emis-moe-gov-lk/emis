FROM mcr.microsoft.com/devcontainers/base:debian

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# -----------------------------
# Install PHP + tools + git
# -----------------------------
RUN apt-get update && apt-get install -y \
    php8.4 \
    php8.4-cli \
    php8.4-common \
    php8.4-gd \
    php8.4-mbstring \
    php8.4-xml \
    php8.4-zip \
    php8.4-intl \
    php8.4-mysql \
    php8.4-curl \
    php8.4-bcmath \
    php8.4-readline \
    git \
    curl \
    wget \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    && rm -rf /var/lib/apt/lists/*

# Ensure PHP 8.4 is default
RUN update-alternatives --set php /usr/bin/php8.4 || true

# -----------------------------
# Install Composer
# -----------------------------
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# -----------------------------
# Install Oh My Posh
# -----------------------------
RUN curl -s https://ohmyposh.dev/install.sh | bash -s -- -d /usr/local/bin

# -----------------------------
# Install Oh My Posh themes
# -----------------------------
RUN mkdir -p /root/.poshthemes \
    && wget https://github.com/JanDeDobbeleer/oh-my-posh/releases/latest/download/themes.zip \
    -O /root/.poshthemes/themes.zip \
    && unzip /root/.poshthemes/themes.zip -d /root/.poshthemes \
    && rm /root/.poshthemes/themes.zip

# -----------------------------
# Git default identity
# -----------------------------
RUN git config --global user.name "Dev Container" \
 && git config --global user.email "dev@local"

# -----------------------------
# Set working directory
# -----------------------------
WORKDIR /workspace

# -----------------------------
# Enable Oh My Posh (SPACE theme with fallback)
# -----------------------------
RUN echo 'if [ -f /root/.poshthemes/space.omp.json ]; then \
    eval "$(oh-my-posh init bash --config /root/.poshthemes/space.omp.json)"; \
else \
    eval "$(oh-my-posh init bash --config /root/.poshthemes/jandedobbeleer.omp.json)"; \
fi' >> /root/.bashrc