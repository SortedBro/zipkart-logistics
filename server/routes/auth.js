const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

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
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

function setCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production' || (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'));
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd ? true : false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

router.post('/register', async (req, res) => {
  try {
    const { company_name, city, name, email, password, confirm_password } = req.body;
    if (!company_name || !name || !email || !password) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const company = await Company.create({ name: company_name, city });
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await User.create({
      company: company._id,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'owner',
    });

    const token = signToken(user, company.name);
    setCookie(res, token);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, companyName: company.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase(), active: true }).populate('company');
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
