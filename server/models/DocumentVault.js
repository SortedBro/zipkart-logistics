const mongoose = require('mongoose');

const documentVaultSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true },
    documentType: { 
      type: String, 
      enum: ['RC', 'Insurance', 'PUC', 'Permit', 'Fitness', 'Driving License', 'Aadhar', 'Contract', 'Agreement', 'Other'], 
      required: true 
    },
    expiryDate: { type: Date },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

documentVaultSchema.index({ company: 1 });

module.exports = mongoose.model('DocumentVault', documentVaultSchema);
