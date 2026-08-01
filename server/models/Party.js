const mongoose = require('mongoose');

const partySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['customer', 'supplier'], default: 'customer' },
    phone: { type: String },
    email: { type: String, trim: true, lowercase: true },
    gstin: { type: String },
    address: { type: String },
    openingBalance: { type: Number, default: 0 },

    // Extended profile (additive; suppliers are Parties with type 'supplier').
    openingDate: { type: String },
    aadhaarNumber: { type: String },
    panNumber: { type: String },
    category: { type: String },
    managerName: { type: String },
    managerNumber: { type: String },

    // Bank / payment details (mainly for suppliers).
    account: {
      accountName: { type: String },
      accountNumber: { type: String },
      ifsc: { type: String },
      upiId: { type: String },
    },

    // Uploaded documents — each value is an object-storage URL or a base64 data URL.
    documents: {
      gst: { type: String },
      panCard: { type: String },
      visitingCard: { type: String },
      aadhaar: { type: String },
    },
  },
  { timestamps: true }
);

partySchema.index({ company: 1, name: 1 });

module.exports = mongoose.model('Party', partySchema);
