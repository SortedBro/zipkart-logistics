const express = require('express');
const Company = require('../models/Company');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { httpError } = require('../middleware/errorHandler');

const router = express.Router();

// Editable company-profile fields (single source of truth for the whitelist).
const EDITABLE_FIELDS = ['name', 'logo', 'gstin', 'address', 'city', 'state', 'pincode', 'phone', 'email'];
const MAX_LOGO_CHARS = 1_500_000; // ~1 MB image as a base64 data URL

// Any authenticated user may READ the company profile (needed for headers, print, etc).
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const company = await Company.findById(req.user.companyId);
    if (!company) return res.status(404).json({ error: 'Company profile not found.' });
    res.json({ company });
  })
);

// Only an admin may UPDATE it.
router.put(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const company = await Company.findById(req.user.companyId);
    if (!company) return res.status(404).json({ error: 'Company profile not found.' });

    if (req.body.name !== undefined && !String(req.body.name).trim()) {
      throw httpError(400, 'Company name cannot be empty.');
    }
    if (typeof req.body.logo === 'string' && req.body.logo.length > MAX_LOGO_CHARS) {
      throw httpError(413, 'Logo image is too large (max ~1 MB).');
    }

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) company[field] = req.body[field];
    }

    await company.save();
    res.json({ company });
  })
);

module.exports = router;
