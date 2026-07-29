const mongoose = require('mongoose');
const config = require('./config');

// Connects to MongoDB and FAILS FAST on error. Previously the connect error was
// swallowed and the server booted anyway, so every request 500'd against no database.
async function connectDB() {
  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('[db] MongoDB reconnected'));
  mongoose.connection.on('error', (err) => console.error('[db] MongoDB error:', err.message));

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] FATAL: MongoDB connection failed:', err.message);
    console.error('[db] Check MONGODB_URI in server/.env, or that your database is reachable.');
    process.exit(1);
  }
}

module.exports = connectDB;
