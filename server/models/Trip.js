const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    bilty: { type: mongoose.Schema.Types.ObjectId, ref: 'Bilty' },
    fromCity: { type: String },
    toCity: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    status: { type: String, enum: ['loading', 'in-transit', 'delivered'], default: 'loading' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
