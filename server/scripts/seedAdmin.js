// One-time bootstrap for this single-company deployment.
//
//   npm run seed:admin
//
// Ensures exactly one Company exists and that an admin login exists. Idempotent:
// running it again will NOT overwrite an existing admin unless SEED_RESET_PASSWORD=true.
//
// Configure via server/.env (or inline env vars):
//   COMPANY_NAME      default "My Company"
//   ADMIN_NAME        default "Administrator"
//   ADMIN_EMAIL       required
//   ADMIN_PASSWORD    required (min 8 chars)
//   SEED_RESET_PASSWORD=true   reset the password if the admin already exists
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const Company = require('../models/Company');
const User = require('../models/User');

async function seed() {
  const companyName = (process.env.COMPANY_NAME || 'My Company').trim();
  const adminName = (process.env.ADMIN_NAME || 'Administrator').trim();
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const resetPassword = String(process.env.SEED_RESET_PASSWORD).toLowerCase() === 'true';

  if (!adminEmail || !adminPassword) {
    console.error('[seed] ADMIN_EMAIL and ADMIN_PASSWORD are required (set them in server/.env).');
    process.exit(1);
  }
  if (adminPassword.length < 8) {
    console.error('[seed] ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log('[seed] connected to MongoDB');

  // Single company: reuse the oldest existing one, or create it.
  let company = await Company.findOne().sort({ createdAt: 1 });
  if (!company) {
    company = await Company.create({ name: companyName });
    console.log(`[seed] created company "${company.name}"`);
  } else {
    console.log(`[seed] using existing company "${company.name}"`);
  }

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    if (resetPassword) {
      existing.passwordHash = bcrypt.hashSync(adminPassword, config.bcryptRounds);
      existing.role = 'owner';
      existing.active = true;
      existing.company = company._id;
      await existing.save();
      console.log(`[seed] reset password for existing admin ${adminEmail}`);
    } else {
      console.log(`[seed] admin ${adminEmail} already exists — skipping (set SEED_RESET_PASSWORD=true to reset).`);
    }
  } else {
    await User.create({
      company: company._id,
      name: adminName,
      email: adminEmail,
      passwordHash: bcrypt.hashSync(adminPassword, config.bcryptRounds),
      role: 'owner',
      active: true,
    });
    console.log(`[seed] created admin ${adminEmail}`);
  }

  await mongoose.disconnect();
  console.log('[seed] done');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});
