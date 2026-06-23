const app = require('./app');
const config = require('./config');
const runMigrations = require('./db/migrate');

async function start() {
  if (process.env.SKIP_MIGRATIONS === 'true') {
    console.log('[server] Skipping migrations (SKIP_MIGRATIONS=true)');
  } else {
    try {
      await runMigrations();
    } catch (err) {
      console.error('[server] Migration failed, shutting down:', err.message);
      process.exit(1);
    }
  }

  app.listen(config.port, () => {
    console.log(`[server] alert-service running on port ${config.port} (${config.nodeEnv})`);
  });
}

start();
