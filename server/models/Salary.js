const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    personType: { type: String, enum: ['Driver', 'Staff'], required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    personName: { type: String, required: true, trim: true },
    month: { type: String, required: true }, // e.g. "August"
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    advanceDeductions: { type: Number, default: 0 },
    finesDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    paymentMode: { 
      type: String, 
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque'], 
      default: 'Bank Transfer' 
    },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Paid' },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

salarySchema.index({ company: 1, year: 1, month: 1 });

module.exports = mongoose.model('Salary', salarySchema);
