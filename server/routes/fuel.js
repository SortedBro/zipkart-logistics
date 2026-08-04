const express = require('express');
const FuelEntry = require('../models/FuelEntry');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { truckId } = req.query;
    const query = { company: req.user.companyId };
    if (truckId) query.truck = truckId;

    const fuelEntries = await FuelEntry.find(query)
      .populate('truck', 'number type')
      .populate('driver', 'name mobile')
      .sort({ date: -1 });

    const totalLiters = fuelEntries.reduce((sum, f) => sum + f.quantityLiters, 0);
    const totalSpent = fuelEntries.reduce((sum, f) => sum + f.totalAmount, 0);
    const avgRate = totalLiters > 0 ? (totalSpent / totalLiters).toFixed(2) : 0;

    res.json({ fuelEntries, stats: { totalLiters, totalSpent, avgRate } });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { truck, trip, date, quantityLiters, ratePerLiter, totalAmount, odometerReading, fuelStationVendor, driver, notes } = req.body;

    if (!truck || !quantityLiters || !ratePerLiter || !odometerReading) {
      return res.status(400).json({ error: 'Truck, quantity in liters, rate per liter, and odometer reading are required.' });
    }

    const qty = Number(quantityLiters);
    const rate = Number(ratePerLiter);
    const total = totalAmount ? Number(totalAmount) : (qty * rate);

    const fuelEntry = await FuelEntry.create({
      company: req.user.companyId,
      truck,
      trip: trip || null,
      date: date || new Date(),
      quantityLiters: qty,
      ratePerLiter: rate,
      totalAmount: total,
      odometerReading: Number(odometerReading),
      fuelStationVendor,
      driver: driver || null,
      notes,
    });

    res.status(201).json({ fuelEntry });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await FuelEntry.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Fuel entry not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
