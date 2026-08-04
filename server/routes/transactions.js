const express = require('express');
const Transaction = require('../models/Transaction');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { account, type } = req.query;
    const query = { company: req.user.companyId };
    if (account) query.account = account;
    if (type) query.type = type;

    const transactions = await Transaction.find(query).sort({ date: -1 });

    const totalCredit = transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalCredit - totalDebit;

    res.json({ transactions, stats: { totalCredit, totalDebit, netBalance } });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { date, amount, account, type, referenceNumber, description } = req.body;

    if (!amount || !type || !description) {
      return res.status(400).json({ error: 'Amount, type (Credit/Debit), and description are required.' });
    }

    const transaction = await Transaction.create({
      company: req.user.companyId,
      date: date || new Date(),
      amount: Number(amount),
      account: account || 'Cash in Hand',
      type,
      referenceNumber,
      description,
    });

    res.status(201).json({ transaction });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await Transaction.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
