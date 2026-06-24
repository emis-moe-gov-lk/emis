require('dotenv').config();

const required = [
  'APIM_BASE_URL',
  'CORS_ORIGIN',
  'WSO2_JWKS_URI',
  'WSO2_ISSUER',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'LARAVEL_BASE_URL',
  'LARAVEL_SERVICE_SECRET',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const config = Object.freeze({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  apim: {
    baseUrl: process.env.APIM_BASE_URL,
  },

  cors: {
    origin: process.env.CORS_ORIGIN,
  },

  wso2: {
    jwksUri: process.env.WSO2_JWKS_URI,
    issuer: process.env.WSO2_ISSUER,
    audience: process.env.WSO2_AUDIENCE || null,
    jwksCacheTtl: parseInt(process.env.JWKS_CACHE_TTL || '3600', 10),
  },

  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    migrateUser: process.env.DB_MIGRATE_USER || process.env.DB_USER,
    migratePassword: process.env.DB_MIGRATE_PASSWORD || process.env.DB_PASSWORD,
  },

  laravel: {
    baseUrl: process.env.LARAVEL_BASE_URL,
    serviceSecret: process.env.LARAVEL_SERVICE_SECRET,
  },
});

module.exports = config;
