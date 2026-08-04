const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    category: { 
      type: String, 
      enum: ['Fuel', 'Toll', 'Maintenance', 'Driver Salary', 'Staff Salary', 'Office', 'Vendor Payment', 'Other'], 
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    paidBy: { type: String, trim: true },
    paymentMode: { 
      type: String, 
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card'], 
      default: 'Cash' 
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

expenseSchema.index({ company: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
