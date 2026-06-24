const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('../config');

async function runMigrations() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    user: config.db.migrateUser,
    password: config.db.migratePassword,
    multipleStatements: true,
  });

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await conn.query(sql);
    console.log(`[migrate] Applied: ${file}`);
  }

  await conn.end();
  console.log('[migrate] All migrations complete.');
}

module.exports = runMigrations;
