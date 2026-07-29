const mongoose = require('mongoose');

const partySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['customer', 'supplier'], default: 'customer' },
    phone: { type: String },
    gstin: { type: String },
    address: { type: String },
    openingBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Party', partySchema);
