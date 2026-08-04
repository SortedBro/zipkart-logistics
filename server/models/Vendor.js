const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    city: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    commissionType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
    commissionValue: { type: Number, default: 0 },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    userAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

vendorSchema.index({ company: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
