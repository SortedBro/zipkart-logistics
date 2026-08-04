const express = require('express');
const DocumentVault = require('../models/DocumentVault');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const documents = await DocumentVault.find({ company: req.user.companyId })
      .populate('truck', 'number type')
      .populate('driver', 'name mobile')
      .sort({ createdAt: -1 });
    res.json({ documents });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, documentType, expiryDate, truck, driver, fileUrl, fileName, notes } = req.body;

    if (!title || !documentType || !fileUrl) {
      return res.status(400).json({ error: 'Title, document type, and file URL are required.' });
    }

    const doc = await DocumentVault.create({
      company: req.user.companyId,
      title,
      documentType,
      expiryDate: expiryDate || null,
      truck: truck || null,
      driver: driver || null,
      fileUrl,
      fileName,
      notes,
    });

    res.status(201).json({ doc });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await DocumentVault.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Document not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
