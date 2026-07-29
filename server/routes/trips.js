const express = require('express');
const Trip = require('../models/Trip');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const trips = await Trip.find({ company: req.user.companyId })
      .sort({ createdAt: -1 })
      .populate('truck', 'number')
      .populate('bilty', 'lrNumber');
    res.json({ trips });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { truck_id, bilty_id, from_city, to_city, start_date, status } = req.body;
    if (!truck_id) return res.status(400).json({ error: 'Truck is required.' });
    const trip = await Trip.create({
      company: req.user.companyId,
      truck: truck_id,
      bilty: bilty_id || undefined,
      fromCity: from_city,
      toCity: to_city,
      startDate: start_date || new Date().toISOString().slice(0, 10),
      status: status || 'loading',
    });
    res.status(201).json({ trip });
  })
);

router.patch(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const update = { status };
    if (status === 'delivered') update.endDate = new Date().toISOString().slice(0, 10);
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      update,
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ trip });
  })
);

module.exports = router;
