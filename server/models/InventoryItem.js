const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    skuModel: { type: String, trim: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: true, default: 'Pcs', trim: true },
    lowStockAlertLevel: { type: Number, default: 5 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ company: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
