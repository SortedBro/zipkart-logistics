const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['owner', 'manager', 'accountant', 'vendor', 'driver', 'staff'], 
      default: 'staff' 
    },
    phone: { type: String, trim: true },
    driverRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    vendorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    permissions: {
      dashboard: { type: Boolean, default: true },
      bilties:   { type: Boolean, default: true },
      parties:   { type: Boolean, default: true },
      trucks:    { type: Boolean, default: true },
      trips:     { type: Boolean, default: true },
      tracking:  { type: Boolean, default: true },
      finance:   { type: Boolean, default: true },
      hr:        { type: Boolean, default: true },
      resources: { type: Boolean, default: true },
      documents: { type: Boolean, default: true },
      reports:   { type: Boolean, default: true },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ company: 1 });

module.exports = mongoose.model('User', userSchema);
