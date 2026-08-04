const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    altMobile: { type: String, trim: true },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
    address: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    licenseExpiry: { type: Date },
    aadharNumber: { type: String, trim: true },
    monthlySalary: { type: Number, required: true, default: 0 },
    dutyStatus: { 
      type: String, 
      enum: ['On Duty', 'Off Duty', 'On Leave'], 
      default: 'Off Duty' 
    },
    joiningDate: { type: Date },
    photoUrl: { type: String },
    licenseDocUrl: { type: String },
    aadharDocUrl: { type: String },
    notes: { type: String, trim: true },
    userAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

driverSchema.index({ company: 1 });

module.exports = mongoose.model('Driver', driverSchema);
