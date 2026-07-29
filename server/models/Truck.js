const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    number: { type: String, required: true },
    type: { type: String },
    vehicleLength: { type: String },
    ownerType: { type: String, enum: ['own', 'market'], default: 'own' },
    ownerName: { type: String },
    ownerPhone: { type: String },
    driverName: { type: String },
    driverPhone: { type: String },

    // Expiry & Reminder dates
    rcExpiryDate: { type: String },
    insuranceExpiryDate: { type: String },
    permitExpiryDate: { type: String },
    fitnessExpiryDate: { type: String },
    pucExpiryDate: { type: String },
    taxPaidTill: { type: String },

    // Vehicle status & maintenance
    currentOdometer: { type: Number },
    lastServiceDate: { type: String },
    nextServiceDueKm: { type: Number },
    tyreNumber: { type: String },
    remarks: { type: String },

    // Uploaded Documents
    documents: {
      rcDocument: { type: String },
      insuranceDocument: { type: String },
      panCardDocument: { type: String },
      fitnessDocument: { type: String },
      permitDocument: { type: String },
      taxDocument: { type: String },
      otherDocument: { type: String },
    },
  },
  { timestamps: true }
);

truckSchema.index({ company: 1, number: 1 });

module.exports = mongoose.model('Truck', truckSchema);

