const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    account: { 
      type: String, 
      enum: ['Cash in Hand', 'Bank Account'], 
      required: true, 
      default: 'Cash in Hand' 
    },
    type: { type: String, enum: ['Credit', 'Debit'], required: true },
    referenceNumber: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

transactionSchema.index({ company: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
