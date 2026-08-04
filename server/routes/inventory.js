const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await InventoryItem.find({ company: req.user.companyId }).sort({ itemName: 1 });
    res.json({ items });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { itemName, category, skuModel, quantity, unit, lowStockAlertLevel, description } = req.body;

    if (!itemName || !category) {
      return res.status(400).json({ error: 'Item name and category are required.' });
    }

    const item = await InventoryItem.create({
      company: req.user.companyId,
      itemName,
      category,
      skuModel,
      quantity: Number(quantity) || 0,
      unit: unit || 'Pcs',
      lowStockAlertLevel: lowStockAlertLevel !== undefined ? Number(lowStockAlertLevel) : 5,
      description,
    });

    res.status(201).json({ item });
  })
);

router.patch(
  '/:id/adjust',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await InventoryItem.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const adjustment = Number(req.body.adjustment) || 0;
    item.quantity = Math.max(0, item.quantity + adjustment);
    await item.save();

    res.json({ item });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await InventoryItem.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Item not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
