const express = require('express');
const Salary = require('../models/Salary');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const salaries = await Salary.find({ company: req.user.companyId })
      .populate('driver', 'name mobile')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ salaries });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      personType,
      driverId,
      userId,
      personName,
      month,
      year,
      basicSalary,
      allowances,
      incentives,
      advanceDeductions,
      finesDeductions,
      paymentMode,
      paymentStatus,
      notes,
    } = req.body;

    if (!personType || !personName || !month || !year || basicSalary === undefined) {
      return res.status(400).json({ error: 'Person type, name, month, year, and basic salary are required.' });
    }

    const basic = Number(basicSalary) || 0;
    const allow = Number(allowances) || 0;
    const inc = Number(incentives) || 0;
    const adv = Number(advanceDeductions) || 0;
    const fines = Number(finesDeductions) || 0;

    const netSalary = Math.max(0, basic + allow + inc - adv - fines);

    const salary = await Salary.create({
      company: req.user.companyId,
      personType,
      driver: driverId || null,
      user: userId || null,
      personName,
      month,
      year: Number(year),
      basicSalary: basic,
      allowances: allow,
      incentives: inc,
      advanceDeductions: adv,
      finesDeductions: fines,
      netSalary,
      paymentMode: paymentMode || 'Bank Transfer',
      paymentStatus: paymentStatus || 'Paid',
      paymentDate: new Date(),
      notes,
    });

    res.status(201).json({ salary });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await Salary.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Salary record not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
