const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    invoiceNumber: { type: String, required: true, trim: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    bilty: { type: mongoose.Schema.Types.ObjectId, ref: 'Bilty' },
    customerName: { type: String, required: true, trim: true },
    customerMobile: { type: String, trim: true },
    customerAddress: { type: String, trim: true },
    subtotal: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    paymentMode: { 
      type: String, 
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit'], 
      default: 'Cash' 
    },
    status: { 
      type: String, 
      enum: ['Paid', 'Unpaid', 'Partial', 'Overdue'], 
      default: 'Unpaid' 
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ company: 1, invoiceNumber: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
