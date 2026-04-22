# Run Backend Locally

This runbook covers two ways to run the EMIS backend locally: Docker and bare metal.

> **Docker is the recommended method.** It handles all dependencies, migrations, and configuration automatically with minimal setup.

---

## Option A — Docker (Recommended)

### Prerequisites

| Tool | Version |
|---|---|
| Docker | Latest stable |
| Docker Compose | v2+ |

---

### Steps

#### 1. Navigate to the Backend Directory

From the repo root:

```bash
cd emis/backend
```

---

#### 2. Set Up Environment

```bash
cp .env.example .env
```

Only these values need to be set for Docker — everything else is handled automatically:

```env
DB_DATABASE=emis
DB_PASSWORD=
```

> Optionally set `APP_PORT` (default `8090`) and `DB_EXTERNAL_PORT` (default `3308`) to change the exposed ports.

> **WSO2 / Asgardeo Auth:** If you are not connecting to the WSO2 identity provider, set `WSO2_ENABLED=false` in your `.env`.

---

#### 3. Start All Services

```bash
docker compose up -d
```

This starts three containers: `emis-app` (PHP-FPM), `emis-nginx`, and `emis-mysql`.

The app container automatically:
- Installs Composer dependencies
- Generates the `APP_KEY` if not set
- Runs all database migrations
- Clears config and route caches

---

#### 4. Seed the Database

```bash
docker exec -it emis-app php artisan db:seed
```

This runs all seeders in order, including:
- Reference data: provinces, districts, cities, GN divisions
- Education offices: provincial, zonal, divisional
- Institutions, subjects, services, ranks
- Roles, permissions, and a default super admin user

---

### Verify

| Resource | URL |
|---|---|
| API Base | `http://localhost:8090/api` |
| API Docs (Scramble) | `http://localhost:8090/docs/api` |
| MySQL (external) | `localhost:3308` |

---

### Stopping the Services

```bash
docker compose down
```

To also remove the database volume (full reset):

```bash
docker compose down -v
```

---

## Option B — Bare Metal

### Prerequisites

| Tool | Version |
|---|---|
| PHP | 8.2 or higher |
| Composer | 2.x |
| MySQL | 8.0 |
| Node.js | Any LTS (required for `composer dev`) |

---

### Steps

#### 1. Navigate to the Backend Directory

From the repo root:

```bash
cd emis/backend
```

---

#### 2. Install PHP Dependencies

```bash
composer install
```

---

#### 3. Set Up Environment

```bash
cp .env.example .env
```

Then open `.env` and fill in the following:

```env
APP_URL=http://localhost:8000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=emis
DB_USERNAME=root
DB_PASSWORD=
```

> **WSO2 / Asgardeo Auth:** If you are not connecting to the WSO2 identity provider, set `WSO2_ENABLED=false` in your `.env`. Without this, authentication may fail on login attempts.

---

#### 4. Generate Application Key

```bash
php artisan key:generate
```

---

#### 5. Run Migrations

```bash
php artisan migrate
```

---

#### 6. Seed the Database

```bash
php artisan db:seed
```

This runs all seeders in order, including:
- Reference data: provinces, districts, cities, GN divisions
- Education offices: provincial, zonal, divisional
- Institutions, subjects, services, ranks
- Roles, permissions, and a default super admin user

---

#### 7. Start the Server

**Recommended — all services together:**

```bash
composer dev
```

This starts three processes concurrently:
- `php artisan serve` — API server on `http://localhost:8000`
- `php artisan queue:listen` — processes background jobs
- `php artisan pail` — streams application logs

**Or start each individually:**

```bash
php artisan serve          # API server
php artisan queue:listen   # Queue worker
php artisan pail           # Log watcher
```

---

### Verify

| Resource | URL |
|---|---|
| API Base | `http://localhost:8000/api` |
| API Docs (Scramble) | `http://localhost:8000/docs/api` |

---

## Common Commands

| Command | Description |
|---|---|
| `php artisan migrate` | Run pending migrations |
| `php artisan migrate:fresh --seed` | Drop all tables, re-migrate, and re-seed |
| `php artisan db:seed` | Run all seeders |
| `php artisan route:list` | List all registered API routes |
| `php artisan config:clear` | Clear cached config |
| `php artisan route:clear` | Clear cached routes |
| `php artisan test` | Run the test suite |
| `composer test` | Clear config then run tests |

---

## Troubleshooting

**`APP_KEY` not set error**
Run `php artisan key:generate`. This must be done before any other artisan command.

**Migration fails — cannot connect to database**
Check `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` in `.env`. Ensure MySQL is running.

**`storage` or `bootstrap/cache` permission errors**
```bash
chmod -R 775 storage bootstrap/cache
```

**`composer dev` fails — `npx` not found**
Node.js is required. Install it from [nodejs.org](https://nodejs.org) and retry.

**WSO2 auth errors on login**
Set `WSO2_ENABLED=false` in `.env` if you are running without the Asgardeo identity provider.

**Class not found after adding a new file**
```bash
composer dump-autoload
```

**Docker — port already in use**
Change `APP_PORT` or `DB_EXTERNAL_PORT` in `.env` to a free port and re-run `docker compose up -d`.

**Docker — migrations fail on first start**
The app container waits for MySQL to be healthy before running. If it still fails, run migrations manually:
```bash
docker exec -it emis-app php artisan migrate --force
```
