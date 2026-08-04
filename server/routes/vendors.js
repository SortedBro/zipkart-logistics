const express = require('express');
const Vendor = require('../models/Vendor');
const Truck = require('../models/Truck');
const Trip = require('../models/Trip');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const vendors = await Vendor.find({ company: companyId }).sort({ name: 1 }).lean();

    // Attach linked trucks count to each vendor
    const truckCounts = await Truck.aggregate([
      { $match: { company: companyId, vendor: { $ne: null } } },
      { $group: { _id: '$vendor', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(truckCounts.map(c => [String(c._id), c.count]));

    const result = vendors.map(v => ({
      ...v,
      linkedTrucksCount: countMap.get(String(v._id)) || 0,
    }));

    res.json({ vendors: result });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const vendor = await Vendor.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });

    const linkedTrucks = await Truck.find({ company: req.user.companyId, vendor: vendor._id }).sort({ number: 1 });
    const truckIds = linkedTrucks.map(t => t._id);
    const trips = await Trip.find({ company: req.user.companyId, truck: { $in: truckIds } }).sort({ createdAt: -1 });

    const totalFreight = trips.reduce((sum, t) => sum + (t.freight || t.customerAmount || 0), 0);

    res.json({ vendor, linkedTrucks, trips, stats: { totalTrucks: linkedTrucks.length, totalTrips: trips.length, totalFreight } });
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
