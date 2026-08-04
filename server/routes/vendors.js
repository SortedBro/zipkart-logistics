const express = require('express');
const Vendor = require('../models/Vendor');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({ company: req.user.companyId }).sort({ name: 1 });
    res.json({ vendors });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, contactPerson, mobile, email, city, gstNumber, address, commissionType, commissionValue, openingBalance } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ error: 'Vendor name and mobile are required.' });
    }

    const openBal = Number(openingBalance) || 0;

    const vendor = await Vendor.create({
      company: req.user.companyId,
      name,
      contactPerson,
      mobile,
      email,
      city,
      gstNumber,
      address,
      commissionType: commissionType || 'Percentage',
      commissionValue: Number(commissionValue) || 0,
      openingBalance: openBal,
      currentBalance: openBal,
      active: true,
    });

    res.status(201).json({ vendor });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });

    const fields = ['name', 'contactPerson', 'mobile', 'email', 'city', 'gstNumber', 'address', 'commissionType', 'commissionValue', 'active'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) vendor[f] = req.body[f];
    });

    await vendor.save();
    res.json({ vendor });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await Vendor.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Vendor not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
