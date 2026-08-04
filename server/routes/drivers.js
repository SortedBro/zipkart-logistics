const express = require('express');
const Driver = require('../models/Driver');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const drivers = await Driver.find({ company: req.user.companyId })
      .populate('assignedVehicle', 'number type')
      .sort({ name: 1 });
    res.json({ drivers });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      name,
      mobile,
      altMobile,
      assignedVehicle,
      address,
      licenseNumber,
      licenseExpiry,
      aadharNumber,
      monthlySalary,
      dutyStatus,
      joiningDate,
      photoUrl,
      licenseDocUrl,
      aadharDocUrl,
      notes,
    } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile number are required.' });
    }

    const driver = await Driver.create({
      company: req.user.companyId,
      name,
      mobile,
      altMobile,
      assignedVehicle: assignedVehicle || null,
      address,
      licenseNumber,
      licenseExpiry: licenseExpiry || null,
      aadharNumber,
      monthlySalary: monthlySalary ? Number(monthlySalary) : 0,
      dutyStatus: dutyStatus || 'Off Duty',
      joiningDate: joiningDate || null,
      photoUrl,
      licenseDocUrl,
      aadharDocUrl,
      notes,
    });

    res.status(201).json({ driver });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.user.companyId })
      .populate('assignedVehicle', 'number type');
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });
    res.json({ driver });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });

    const fields = [
      'name', 'mobile', 'altMobile', 'assignedVehicle', 'address',
      'licenseNumber', 'licenseExpiry', 'aadharNumber', 'monthlySalary',
      'dutyStatus', 'joiningDate', 'photoUrl', 'licenseDocUrl', 'aadharDocUrl', 'notes'
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) driver[f] = req.body[f];
    });

    await driver.save();
    res.json({ driver });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await Driver.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Driver not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
