const express = require('express');
const Expense = require('../models/Expense');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { category, truckId, dateFrom, dateTo } = req.query;
    const query = { company: req.user.companyId };

    if (category) query.category = category;
    if (truckId) query.truck = truckId;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const expenses = await Expense.find(query)
      .populate('truck', 'number type')
      .populate('trip', 'route')
      .sort({ date: -1 });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ expenses, totalAmount });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, date, category, amount, truck, trip, paidBy, paymentMode, notes } = req.body;

    if (!title || !category || amount === undefined) {
      return res.status(400).json({ error: 'Title, category, and amount are required.' });
    }

    const expense = await Expense.create({
      company: req.user.companyId,
      title,
      date: date || new Date(),
      category,
      amount: Number(amount),
      truck: truck || null,
      trip: trip || null,
      paidBy,
      paymentMode: paymentMode || 'Cash',
      notes,
    });

    res.status(201).json({ expense });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });

    const fields = ['title', 'date', 'category', 'amount', 'truck', 'trip', 'paidBy', 'paymentMode', 'notes'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) expense[f] = req.body[f];
    });

    await expense.save();
    res.json({ expense });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await Expense.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Expense not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
