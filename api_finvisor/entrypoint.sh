#!/bin/bash
set -e

cd /var/www/api_finvisor

# Set correct permissions for storage and bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
chmod 644 .env

# Install dependencies
composer install --no-interaction

# Generate key if not set
php artisan key:generate --no-interaction

# Clear and cache config
php artisan config:clear
php artisan config:cache

# Run migrations
php artisan migrate --force

# Start PHP-FPM in foreground (important for Docker)
exec php artisan serve --host=0.0.0.0 --port=9000
