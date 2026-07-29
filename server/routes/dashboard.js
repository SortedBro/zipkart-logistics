const express = require('express');
const mongoose = require('mongoose');
const Bilty = require('../models/Bilty');
const Truck = require('../models/Truck');
const Trip = require('../models/Trip');
const Party = require('../models/Party');
const Payment = require('../models/Payment');
const TruckExpense = require('../models/TruckExpense');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    const [totalBilties, totalTrucks, activeTrips, totalParties] = await Promise.all([
      Bilty.countDocuments({ company: companyId }),
      Truck.countDocuments({ company: companyId }),
      Trip.countDocuments({ company: companyId, status: { $ne: 'delivered' } }),
      Party.countDocuments({ company: companyId }),
    ]);

    const [freightAgg] = await Bilty.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: null, total: { $sum: { $add: ['$freight', '$otherCharges'] } }, advance: { $sum: '$advance' } } },
    ]);
    const [paymentsInAgg] = await Payment.aggregate([
      { $match: { company: companyId, direction: 'in' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const [expenseAgg] = await TruckExpense.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const freightTotal = freightAgg ? freightAgg.total : 0;
    const advanceTotal = freightAgg ? freightAgg.advance : 0;
    const paymentsIn = paymentsInAgg ? paymentsInAgg.total : 0;
    const expenseTotal = expenseAgg ? expenseAgg.total : 0;
    const outstanding = freightTotal - advanceTotal - paymentsIn;

    const recentBilties = await Bilty.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('party', 'name')
      .populate('truck', 'number');

    const recentTrips = await Trip.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('truck', 'number');

    res.json({
      stats: {
        totalBilties,
        totalTrucks,
        activeTrips,
        totalParties,
        freightTotal,
        outstanding,
        expenseTotal,
        profit: freightTotal - expenseTotal,
      },
      recentBilties,
      recentTrips,
    });
  })
);

module.exports = router;
