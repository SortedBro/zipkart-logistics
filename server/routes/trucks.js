const express = require('express');
const mongoose = require('mongoose');
const Truck = require('../models/Truck');
const Bilty = require('../models/Bilty');
const Trip = require('../models/Trip');
const TruckExpense = require('../models/TruckExpense');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

async function computePL(companyId, truckId) {
  const [incomeAgg] = await Bilty.aggregate([
    { $match: { company: companyId, truck: truckId } },
    { $group: { _id: null, total: { $sum: { $add: ['$freight', '$otherCharges'] } } } },
  ]);
  const [expenseAgg] = await TruckExpense.aggregate([
    { $match: { company: companyId, truck: truckId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const income = incomeAgg ? incomeAgg.total : 0;
  const expense = expenseAgg ? expenseAgg.total : 0;
  return { income, expense, profit: income - expense };
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    // Exclude the heavy base64 `documents` blobs from the list payload.
    const trucks = await Truck.find({ company: companyId })
      .select('-documents')
      .populate('vendor', 'name mobile city commissionType commissionValue')
      .sort({ number: 1 })
      .lean();

    // Compute P&L for every truck in two aggregations instead of 2-per-truck (fixes N+1).
    const [incomeByTruck, expenseByTruck] = await Promise.all([
      Bilty.aggregate([
        { $match: { company: companyId, truck: { $ne: null } } },
        { $group: { _id: '$truck', total: { $sum: { $add: ['$freight', '$otherCharges'] } } } },
      ]),
      TruckExpense.aggregate([
        { $match: { company: companyId } },
        { $group: { _id: '$truck', total: { $sum: '$amount' } } },
      ]),
    ]);

    const incomeMap = new Map(incomeByTruck.map((r) => [String(r._id), r.total]));
    const expenseMap = new Map(expenseByTruck.map((r) => [String(r._id), r.total]));

    const withPL = trucks.map((t) => {
      const tid = String(t._id);
      const income = incomeMap.get(tid) || 0;
      const expense = expenseMap.get(tid) || 0;
      return { ...t, pl: { income, expense, profit: income - expense } };
    });

    res.json({ trucks: withPL });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      number,
      type,
      vehicleLength,
      owner_type,
      ownerType,
      vendor,
      ownerName,
      ownerPhone,
      driver_name,
      driverName,
      driver_phone,
      driverPhone,
      rcExpiryDate,
      insuranceExpiryDate,
      permitExpiryDate,
      fitnessExpiryDate,
      pucExpiryDate,
      taxPaidTill,
      currentOdometer,
      lastServiceDate,
      nextServiceDueKm,
      tyreNumber,
      remarks,
      documents,
    } = req.body;

    if (!number) return res.status(400).json({ error: 'Truck number is required.' });

    const truck = await Truck.create({
      company: req.user.companyId,
      number,
      type,
      vehicleLength,
      ownerType: owner_type || ownerType || 'own',
      vendor: vendor || null,
      ownerName,
      ownerPhone,
      driverName: driver_name || driverName,
      driverPhone: driver_phone || driverPhone,
      rcExpiryDate,
      insuranceExpiryDate,
      permitExpiryDate,
      fitnessExpiryDate,
      pucExpiryDate,
      taxPaidTill,
      currentOdometer: currentOdometer ? Number(currentOdometer) : undefined,
      lastServiceDate,
      nextServiceDueKm: nextServiceDueKm ? Number(nextServiceDueKm) : undefined,
      tyreNumber,
      remarks,
      documents: documents || {},
    });

    res.status(201).json({ truck });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const truck = await Truck.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!truck) return res.status(404).json({ error: 'Truck not found.' });

    const fields = [
      'number',
      'type',
      'vehicleLength',
      'vendor',
      'ownerName',
      'ownerPhone',
      'rcExpiryDate',
      'insuranceExpiryDate',
      'permitExpiryDate',
      'fitnessExpiryDate',
      'pucExpiryDate',
      'taxPaidTill',
      'currentOdometer',
      'lastServiceDate',
      'nextServiceDueKm',
      'tyreNumber',
      'remarks',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) truck[f] = req.body[f];
    });

    if (req.body.owner_type || req.body.ownerType) truck.ownerType = req.body.owner_type || req.body.ownerType;
    if (req.body.driver_name || req.body.driverName) truck.driverName = req.body.driver_name || req.body.driverName;
    if (req.body.driver_phone || req.body.driverPhone) truck.driverPhone = req.body.driver_phone || req.body.driverPhone;

    if (req.body.documents) {
      truck.documents = { ...(truck.documents || {}), ...req.body.documents };
    }

    await truck.save();
    res.json({ truck });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const truck = await Truck.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!truck) return res.status(404).json({ error: 'Truck not found.' });

    const pl = await computePL(truck.company, truck._id);
    const expenses = await TruckExpense.find({ company: req.user.companyId, truck: truck._id }).sort({ expenseDate: -1 });
    const trips = await Trip.find({ company: req.user.companyId, truck: truck._id }).sort({ createdAt: -1 });
    const bilties = await Bilty.find({ company: req.user.companyId, truck: truck._id }).sort({ biltyDate: -1 });

    res.json({ truck, pl, expenses, trips, bilties });
  })
);

router.post(
  '/:id/expenses',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { category, amount, expense_date, note } = req.body;
    if (!category || !amount) return res.status(400).json({ error: 'Category and amount are required.' });
    const expense = await TruckExpense.create({
      company: req.user.companyId,
      truck: req.params.id,
      category,
      amount: parseFloat(amount),
      expenseDate: expense_date || new Date().toISOString().slice(0, 10),
      note,
    });
    res.status(201).json({ expense });
  })
);

module.exports = router;
