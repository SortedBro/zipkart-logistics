const express = require('express');
const Attendance = require('../models/Attendance');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const records = await Attendance.find({
      company: req.user.companyId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const drivers = await Driver.find({ company: req.user.companyId }).select('name mobile dutyStatus');
    const staff = await User.find({ company: req.user.companyId, role: { $in: ['staff', 'manager', 'accountant'] } }).select('name email role');

    res.json({ date: startOfDay, records, drivers, staff });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { date, records } = req.body; // records: [{ personType, driverId, userId, personName, status, notes }]

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records array is required.' });
    }

    const logDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

    // Upsert each attendance entry
    const saved = [];
    for (const r of records) {
      const filter = {
        company: req.user.companyId,
        date: { $gte: startOfDay, $lte: endOfDay },
      };
      if (r.driverId) filter.driver = r.driverId;
      else if (r.userId) filter.user = r.userId;
      else filter.personName = r.personName;

      const doc = await Attendance.findOneAndUpdate(
        filter,
        {
          company: req.user.companyId,
          date: startOfDay,
          personType: r.personType || 'Driver',
          driver: r.driverId || null,
          user: r.userId || null,
          personName: r.personName,
          status: r.status || 'Present',
          notes: r.notes || '',
        },
        { upsert: true, new: true }
      );
      saved.push(doc);
    }

    res.json({ success: true, count: saved.length, records: saved });
  })
);

module.exports = router;
