const mongoose = require('mongoose');

const truckExpenseSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    category: { type: String, enum: ['fuel', 'driver_salary', 'maintenance', 'toll', 'other'], required: true },
    amount: { type: Number, required: true },
    expenseDate: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

truckExpenseSchema.index({ company: 1, truck: 1 });

module.exports = mongoose.model('TruckExpense', truckExpenseSchema);
