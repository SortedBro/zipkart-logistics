const express = require('express');
const Party = require('../models/Party');
const Bilty = require('../models/Bilty');
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');

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

router.get('/', requireAuth, async (req, res) => {
  try {
    const parties = await Party.find({ company: req.user.companyId }).sort({ name: 1 });
    const withBalance = await Promise.all(
      parties.map(async (p) => {
        const info = await computeBalance(req.user.companyId, p._id);
        return { ...p.toObject(), balance: info.balance };
      })
    );
    res.json({ parties: withBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, type, phone, gstin, address, opening_balance } = req.body;
    if (!name) return res.status(400).json({ error: 'Party name is required.' });
    const party = await Party.create({
      company: req.user.companyId,
      name,
      type: type || 'customer',
      phone,
      gstin,
      address,
      openingBalance: parseFloat(opening_balance) || 0,
    });
    res.status(201).json({ party });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const info = await computeBalance(req.user.companyId, req.params.id);
    if (!info) return res.status(404).json({ error: 'Party not found.' });

    const bilties = await Bilty.find({ company: req.user.companyId, party: req.params.id }).sort({ biltyDate: -1 });
    const payments = await Payment.find({ company: req.user.companyId, party: req.params.id }).sort({ paymentDate: -1 });

    res.json({ party: info.party, balance: info.balance, bilties, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/payments', requireAuth, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
