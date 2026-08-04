const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, trim: true },
    loanAmount: { type: Number, required: true, min: 0 },
    downPayment: { type: Number, default: 0 },
    interestRate: { type: Number, default: 0 },
    interestType: { type: String, enum: ['Fixed', 'Reducing'], default: 'Fixed' },
    installmentsMonths: { type: Number, required: true, min: 1 },
    emiAmount: { type: Number, required: true, min: 0 },
    installmentsPaid: { type: Number, default: 0 },
    paidAmountTotal: { type: Number, default: 0 },
    pendingBalance: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    emiDeductionDay: { type: Number, default: 5 },
    status: { type: String, enum: ['Active', 'Closed', 'Overdue'], default: 'Active' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

loanSchema.index({ company: 1 });

module.exports = mongoose.model('Loan', loanSchema);
