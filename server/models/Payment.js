const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
    amount: { type: Number, required: true },
    direction: { type: String, enum: ['in', 'out'], required: true },
    note: { type: String },
    paymentDate: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
