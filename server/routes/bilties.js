const express = require('express');
const Bilty = require('../models/Bilty');
const Party = require('../models/Party');
const Truck = require('../models/Truck');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function nextLrNumber(companyId) {
  const count = await Bilty.countDocuments({ company: companyId });
  return `ZIL-${String(count + 1).padStart(5, '0')}`;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const bilties = await Bilty.find({ company: req.user.companyId })
      .sort({ createdAt: -1 })
      .populate('party', 'name')
      .populate('truck', 'number');
    res.json({ bilties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/next-lr', requireAuth, async (req, res) => {
  const lr = await nextLrNumber(req.user.companyId);
  res.json({ lrNumber: lr });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      lr_number,
      bilty_date,
      party_id,
      truck_id,
      consignor,
      consignee,
      from_city,
      to_city,
      material,
      weight,
      freight,
      advance,
      other_charges,
    } = req.body;

    if (!party_id || !bilty_date) return res.status(400).json({ error: 'Party and date are required.' });

    const bilty = await Bilty.create({
      company: req.user.companyId,
      lrNumber: lr_number || (await nextLrNumber(req.user.companyId)),
      biltyDate: bilty_date,
      party: party_id,
      truck: truck_id || undefined,
      consignor,
      consignee,
      fromCity: from_city,
      toCity: to_city,
      material,
      weight: parseFloat(weight) || undefined,
      freight: parseFloat(freight) || 0,
      advance: parseFloat(advance) || 0,
      otherCharges: parseFloat(other_charges) || 0,
      createdBy: req.user.id,
    });

    res.status(201).json({ bilty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const bilty = await Bilty.findOne({ _id: req.params.id, company: req.user.companyId })
      .populate('party', 'name phone address')
      .populate('truck', 'number driverName');
    if (!bilty) return res.status(404).json({ error: 'Bilty not found.' });

    const balance = bilty.freight + bilty.otherCharges - bilty.advance;
    res.json({ bilty, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const bilty = await Bilty.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      { status },
      { new: true }
    );
    if (!bilty) return res.status(404).json({ error: 'Bilty not found.' });
    res.json({ bilty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
