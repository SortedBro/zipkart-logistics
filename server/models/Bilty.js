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
    paidBy: { type: String },
    fromCity: { type: String },
    toCity: { type: String },

    // Shipment / vehicle
    shipmentMode: { type: String, default: 'Road' },
    vehicleSize: { type: String },
    driverName: { type: String },
    ewayBillNo: { type: String },
    ewayBillExpiry: { type: String },
    containerNo: { type: String },

    // Material details
    material: { type: String },
    packingType: { type: String },
    quantity: { type: Number },
    weight: { type: Number },
    invoiceNumber: { type: String },
    invoiceDate: { type: String },
    hsnCode: { type: String },
    valueOfGoods: { type: Number },
    privateMark: { type: String },
    insured: { type: Boolean, default: false },

    // --- Money: freight/advance/otherCharges are the LEDGER + P&L drivers (unchanged). ---
    freight: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },

    // Freight metadata + tax (additive; informational, does not change ledger math)
    actualWeight: { type: Number },
    chargedWeight: { type: Number },
    rateType: { type: String, default: 'FIXED' },
    cgstPercent: { type: Number, default: 0 },
    sgstPercent: { type: Number, default: 0 },
    igstPercent: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    biltyAmount: { type: Number, default: 0 }, // freight + otherCharges + GST + tax (for display/print)
    paymentType: { type: String, default: 'To Be Billed' },
    gstPaidBy: { type: String, default: 'Transporter' },

    status: { type: String, enum: ['pending', 'in-transit', 'delivered', 'paid'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

biltySchema.index({ company: 1, createdAt: -1 });
biltySchema.index({ company: 1, party: 1 });
biltySchema.index({ company: 1, truck: 1 });

module.exports = mongoose.model('Bilty', biltySchema);
