const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAuth, requireOwner } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireOwner, async (req, res) => {
  try {
    const staff = await User.find({ company: req.user.companyId }).select('name email role active createdAt').sort({ createdAt: 1 });
    res.json({ staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireOwner, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'A user with this email already exists.' });
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await User.create({
      company: req.user.companyId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'owner' ? 'owner' : 'staff',
    });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/toggle', requireAuth, requireOwner, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user._id.toString() === req.user.id) return res.status(400).json({ error: 'You cannot deactivate yourself.' });
    user.active = !user.active;
    await user.save();
    res.json({ user: { id: user._id, active: user.active } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
