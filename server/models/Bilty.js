const mongoose = require('mongoose');

const biltySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    lrNumber: { type: String, required: true },
    biltyDate: { type: String, required: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
    consignor: { type: String },
    consignee: { type: String },
    fromCity: { type: String },
    toCity: { type: String },
    material: { type: String },
    weight: { type: Number },
    freight: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'in-transit', 'delivered', 'paid'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bilty', biltySchema);
