const express = require('express');
const Bilty = require('../models/Bilty');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const TruckExpense = require('../models/TruckExpense');
const FuelEntry = require('../models/FuelEntry');
const Trip = require('../models/Trip');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Profit & Loss Report
router.get(
  '/profit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { fromDate, toDate } = req.query;
    const dateFilter = {};
    if (fromDate) dateFilter.$gte = new Date(fromDate);
    if (toDate) dateFilter.$lte = new Date(toDate);

    const matchCompany = { company: req.user.companyId };
    if (fromDate || toDate) matchCompany.createdAt = dateFilter;

    // Income from Invoices & Bilties
    const [invoicesAgg] = await Invoice.aggregate([
      { $match: matchCompany },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const [biltiesAgg] = await Bilty.aggregate([
      { $match: matchCompany },
      { $group: { _id: null, total: { $sum: { $add: ['$freight', '$otherCharges'] } } } },
    ]);

    // Expenses from Expenses & TruckExpenses
    const [expensesAgg] = await Expense.aggregate([
      { $match: matchCompany },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const [truckExpensesAgg] = await TruckExpense.aggregate([
      { $match: matchCompany },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const income = (invoicesAgg?.total || 0) + (biltiesAgg?.total || 0);
    const expense = (expensesAgg?.total || 0) + (truckExpensesAgg?.total || 0);
    const profit = income - expense;

    // Monthly breakdown
    const monthlyList = [
      { month: 'Current Month', income, expense, profit }
    ];

    res.json({ income, expense, profit, monthly: monthlyList });
  })
);

// Expense Analysis
router.get(
  '/expenses',
  requireAuth,
  asyncHandler(async (req, res) => {
    const categories = await Expense.aggregate([
      { $match: { company: req.user.companyId } },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } }
    ]);
    res.json({ categories });
  })
);

// Fuel Efficiency Report
router.get(
  '/fuel',
  requireAuth,
  asyncHandler(async (req, res) => {
    const fuelByTruck = await FuelEntry.aggregate([
      { $match: { company: req.user.companyId } },
      {
        $group: {
          _id: '$truck',
          totalLiters: { $sum: '$quantityLiters' },
          totalSpent: { $sum: '$totalAmount' },
          minOdometer: { $min: '$odometerReading' },
          maxOdometer: { $max: '$odometerReading' },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({ fuelByTruck });
  })
);

module.exports = router;
