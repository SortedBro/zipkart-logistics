const mongoose = require('mongoose');

// The single company this deployment belongs to. Editable from Settings.
// All fields except `name` are optional and additive — existing documents remain valid.
const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String }, // data URL or hosted image URL
    gstin: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
