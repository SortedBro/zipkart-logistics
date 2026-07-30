// Centralized, validated application configuration.
// This is the single place that reads process.env. Everything else imports `config`.
// Fails fast (process.exit) when a required secret is missing so we never boot in an
// insecure or half-configured state.
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

function required(name) {
  const val = process.env[name];
  if (!val || !val.trim()) {
    console.error(`[config] FATAL: missing required environment variable ${name}.`);
    console.error('[config] Copy server/.env.example to server/.env and fill it in.');
    process.exit(1);
  }
  return val.trim();
}

const JWT_SECRET = required('JWT_SECRET');
const EXAMPLE_SECRETS = ['change-this-to-a-long-random-string', 'dev-secret'];

if (EXAMPLE_SECRETS.includes(JWT_SECRET)) {
  if (isProd) {
    console.error('[config] FATAL: JWT_SECRET is still the example value. Refusing to start in production.');
    process.exit(1);
  }
  console.warn('[config] WARNING: JWT_SECRET is the example value — set a real secret before deploying.');
} else if (JWT_SECRET.length < 32) {
  console.warn('[config] WARNING: JWT_SECRET is shorter than 32 chars — use a longer random string in production.');
}

// Origins allowed to make credentialed (cookie) requests. Primary is CLIENT_URL;
// CORS_ORIGINS may add a comma-separated list (e.g. a deployed frontend URL).
const corsOrigins = new Set(
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
);
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
corsOrigins.add(clientUrl);
if (!isProd) {
  corsOrigins.add('http://localhost:5173');
  corsOrigins.add('http://localhost:4173');
  corsOrigins.add('http://127.0.0.1:5173');
}

const config = {
  env: NODE_ENV,
  isProd,
  port: parseInt(process.env.PORT, 10) || 4000,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  clientUrl,
  corsOrigins: [...corsOrigins],
  // Max JSON body size. Large enough for document uploads, bounded to prevent abuse.
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '10mb',
  // Rate limiting. Global limiter is a DoS safety-net; auth limiter guards brute force.
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000,
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60_000,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  },
  // S3-compatible object storage (Cloudflare R2 / AWS S3). All optional: when unset,
  // uploads gracefully fall back to inline base64 so nothing breaks.
  storage: (() => {
    const s = {
      endpoint: (process.env.S3_ENDPOINT || '').trim(),
      region: process.env.S3_REGION || 'auto',
      bucket: (process.env.S3_BUCKET || '').trim(),
      accessKeyId: (process.env.S3_ACCESS_KEY_ID || '').trim(),
      secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY || '').trim(),
      publicUrl: (process.env.S3_PUBLIC_URL || '').trim().replace(/\/$/, ''),
    };
    s.enabled = Boolean(s.bucket && s.accessKeyId && s.secretAccessKey);
    return s;
  })(),
};

module.exports = config;
