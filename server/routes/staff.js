const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');
const { requireAuth, requireOwner } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const staff = await User.find({ company: req.user.companyId })
      .select('name email role active createdAt')
      .sort({ createdAt: 1 });
    res.json({ staff });
  })
);

router.post(
  '/',
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'A user with this email already exists.' });
    const passwordHash = bcrypt.hashSync(password, config.bcryptRounds);
    const user = await User.create({
      company: req.user.companyId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'owner' ? 'owner' : 'staff',
    });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  })
);

router.patch(
  '/:id/toggle',
  requireAuth,
  requireOwner,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user._id.toString() === req.user.id) return res.status(400).json({ error: 'You cannot deactivate yourself.' });
    user.active = !user.active;
    await user.save();
    res.json({ user: { id: user._id, active: user.active } });
  })
);

module.exports = router;
