const express = require('express');
const mongoose = require('mongoose');
const Party = require('../models/Party');
const Bilty = require('../models/Bilty');
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

async function computeBalance(companyId, partyId) {
  const party = await Party.findOne({ _id: partyId, company: companyId });
  if (!party) return null;

  const [billedAgg] = await Bilty.aggregate([
    { $match: { company: party.company, party: party._id } },
    { $group: { _id: null, total: { $sum: { $subtract: [{ $add: ['$freight', '$otherCharges'] }, '$advance'] } } } },
  ]);
  const [inAgg] = await Payment.aggregate([
    { $match: { company: party.company, party: party._id, direction: 'in' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const [outAgg] = await Payment.aggregate([
    { $match: { company: party.company, party: party._id, direction: 'out' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const billed = billedAgg ? billedAgg.total : 0;
  const paidIn = inAgg ? inAgg.total : 0;
  const paidOut = outAgg ? outAgg.total : 0;
  const balance = party.openingBalance + billed - paidIn + paidOut;
  return { party, balance };
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const parties = await Party.find({ company: companyId }).sort({ name: 1 }).lean();

    // Compute every party's balance in two aggregations instead of 3-per-party (fixes N+1).
    // Balance formula is preserved exactly: openingBalance + billed - paidIn + paidOut,
    // where billed = sum(freight + otherCharges - advance).
    const [billedByParty, paymentsByParty] = await Promise.all([
      Bilty.aggregate([
        { $match: { company: companyId } },
        {
          $group: {
            _id: '$party',
            total: { $sum: { $subtract: [{ $add: ['$freight', '$otherCharges'] }, '$advance'] } },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { company: companyId } },
        { $group: { _id: { party: '$party', direction: '$direction' }, total: { $sum: '$amount' } } },
      ]),
    ]);

    const billedMap = new Map(billedByParty.map((b) => [String(b._id), b.total]));
    const inMap = new Map();
    const outMap = new Map();
    for (const row of paymentsByParty) {
      const pid = String(row._id.party);
      if (row._id.direction === 'in') inMap.set(pid, row.total);
      else if (row._id.direction === 'out') outMap.set(pid, row.total);
    }

    const withBalance = parties.map((p) => {
      const pid = String(p._id);
      const billed = billedMap.get(pid) || 0;
      const paidIn = inMap.get(pid) || 0;
      const paidOut = outMap.get(pid) || 0;
      return { ...p, balance: (p.openingBalance || 0) + billed - paidIn + paidOut };
    });

    res.json({ parties: withBalance });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      name,
      type,
      phone,
      email,
      gstin,
      address,
      opening_balance,
      openingDate,
      aadhaarNumber,
      panNumber,
      category,
      managerName,
      managerNumber,
      account,
      documents,
    } = req.body;
    if (!name) return res.status(400).json({ error: 'Party name is required.' });
    const party = await Party.create({
      company: req.user.companyId,
      name,
      type: type || 'customer',
      phone,
      email,
      gstin,
      address,
      openingBalance: parseFloat(opening_balance) || 0,
      openingDate,
      aadhaarNumber,
      panNumber,
      category,
      managerName,
      managerNumber,
      account: account || {},
      documents: documents || {},
    });
    res.status(201).json({ party });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const info = await computeBalance(req.user.companyId, req.params.id);
    if (!info) return res.status(404).json({ error: 'Party not found.' });

    const bilties = await Bilty.find({ company: req.user.companyId, party: req.params.id }).sort({ biltyDate: -1 });
    const payments = await Payment.find({ company: req.user.companyId, party: req.params.id }).sort({ paymentDate: -1 });

    res.json({ party: info.party, balance: info.balance, bilties, payments });
  })
);

router.post(
  '/:id/payments',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { amount, direction, note, payment_date } = req.body;
    if (!amount || !direction) return res.status(400).json({ error: 'Amount and direction are required.' });
    const payment = await Payment.create({
      company: req.user.companyId,
      party: req.params.id,
      amount: parseFloat(amount),
      direction,
      note,
      paymentDate: payment_date || new Date().toISOString().slice(0, 10),
    });
    res.status(201).json({ payment });
  })
);

module.exports = router;
