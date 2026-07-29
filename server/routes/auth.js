const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

function signToken(user, companyName) {
  return jwt.sign(
    {
      id: user._id.toString(),
      companyId: user.company.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      companyName,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function setCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: config.isProd ? 'none' : 'lax',
    secure: config.isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

// NOTE: This is a single-company internal application. There is intentionally NO public
// registration / company sign-up. The first admin is created with `npm run seed:admin`
// (see server/scripts/seedAdmin.js); further employees are added by an admin from the
// Staff page (POST /api/staff, admin-only).

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase(), active: true }).populate('company');
    if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = signToken(user, user.company ? user.company.name : '');
    setCookie(res, token);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company ? user.company.name : '',
      },
    });
  })
);

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      companyName: req.user.companyName,
    },
  });
});

module.exports = router;
