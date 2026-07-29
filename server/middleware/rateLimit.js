const { rateLimit } = require('express-rate-limit');
const config = require('../config');

// Global safety-net limiter (per IP). Generous by default so a busy office behind a
// single IP isn't affected; tune with RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS.
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

// Strict limiter for the login endpoint — brute-force protection.
const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  limit: config.rateLimit.authMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in a few minutes.' },
});

module.exports = { apiLimiter, authLimiter };
