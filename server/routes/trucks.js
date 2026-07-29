const express = require('express');
const Truck = require('../models/Truck');
const Bilty = require('../models/Bilty');
const Trip = require('../models/Trip');
const TruckExpense = require('../models/TruckExpense');
const { requireAuth } = require('../middleware/auth');

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

router.get('/', requireAuth, async (req, res) => {
  try {
    const trucks = await Truck.find({ company: req.user.companyId }).sort({ number: 1 });
    const withPL = await Promise.all(
      trucks.map(async (t) => ({ ...t.toObject(), pl: await computePL(t.company, t._id) }))
    );
    res.json({ trucks: withPL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      number,
      type,
      vehicleLength,
      owner_type,
      ownerType,
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const truck = await Truck.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!truck) return res.status(404).json({ error: 'Truck not found.' });

    const fields = [
      'number',
      'type',
      'vehicleLength',
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', requireAuth, async (req, res) => {
  try {
    const truck = await Truck.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!truck) return res.status(404).json({ error: 'Truck not found.' });

    const pl = await computePL(truck.company, truck._id);
    const expenses = await TruckExpense.find({ company: req.user.companyId, truck: truck._id }).sort({ expenseDate: -1 });
    const trips = await Trip.find({ company: req.user.companyId, truck: truck._id }).sort({ createdAt: -1 });
    const bilties = await Bilty.find({ company: req.user.companyId, truck: truck._id }).sort({ biltyDate: -1 });

    res.json({ truck, pl, expenses, trips, bilties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/expenses', requireAuth, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
