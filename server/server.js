const config = require('./config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

// Behind a proxy (Render/Nginx) so rate limiting and secure cookies see the real client IP.
app.set('trust proxy', 1);

// Request logging: concise colored output in dev, Apache-combined in production.
app.use(morgan(config.isProd ? 'combined' : 'dev'));

// Security headers. CSP is disabled because this process serves JSON, not HTML (CSP
// belongs on the frontend host); CORP is relaxed so the separate frontend origin can read responses.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// --- CORS: strict allowlist. Only origins in config.corsOrigins may send credentials.
// Requests with no Origin header (curl, health checks, same-origin) are allowed.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.trim().replace(/\/$/, '');
      if (
        config.corsOrigins.includes(cleanOrigin) ||
        config.corsOrigins.includes(origin) ||
        cleanOrigin.endsWith('.onrender.com') ||
        !config.isProd
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(apiLimiter); // global DoS safety-net (before body parsing)
app.use(express.json({ limit: config.jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.jsonBodyLimit }));
app.use(cookieParser());
app.use(mongoSanitize()); // strip $ / . operators from body/query/params (NoSQL-injection defense)

app.get('/api/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1; // 1 = connected
  res.status(dbUp ? 200 : 503).json({
    ok: dbUp,
    db: dbUp ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/parties', require('./routes/parties'));
app.use('/api/trucks', require('./routes/trucks'));
app.use('/api/bilties', require('./routes/bilties'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/uploads', require('./routes/uploads'));

app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/fuel', require('./routes/fuel'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/salaries', require('./routes/salaries'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reports', require('./routes/reports'));

// 404 for unmatched routes, then centralized error handler (must be last).
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  const http = require('http');
  const server = http.createServer(app);
  const { Server } = require('socket.io');

  const io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (room) => {
      if (room) socket.join(String(room).toUpperCase());
    });
  });

  app.set('io', io);

  server.listen(config.port, () => {
    console.log(`Zipkart Realtime TMS API running on port ${config.port} (${config.env})`);
  });

  // Graceful shutdown so in-flight requests finish and the DB socket closes cleanly.
  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => console.error('[server] Unhandled promise rejection:', reason));
  process.on('uncaughtException', (err) => {
    console.error('[server] Uncaught exception:', err);
    process.exit(1);
  });
}

start();
