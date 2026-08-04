const express = require('express');
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ company: req.user.companyId })
      .populate('trip', 'route truck driver freight')
      .populate('bilty', 'biltyNumber consignor consignee')
      .sort({ createdAt: -1 });

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalPending = invoices.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0);

    res.json({ invoices, stats: { totalBilled, totalCollected, totalPending } });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const company = await Company.findById(req.user.companyId);
    const prefix = company?.invoicePrefix || 'INV-';

    const {
      trip,
      bilty,
      customerName,
      customerMobile,
      customerAddress,
      subtotal,
      taxPercent,
      discount,
      paidAmount,
      paymentMode,
      status,
      notes,
    } = req.body;

    if (!customerName || subtotal === undefined) {
      return res.status(400).json({ error: 'Customer name and subtotal are required.' });
    }

    const count = await Invoice.countDocuments({ company: req.user.companyId });
    const invoiceNumber = req.body.invoiceNumber || `${prefix}${1001 + count}`;

    const sub = Number(subtotal) || 0;
    const taxP = taxPercent !== undefined ? Number(taxPercent) : (company?.defaultTaxPercent || 18);
    const taxAmt = Math.round((sub * taxP) / 100);
    const disc = Number(discount) || 0;
    const grand = Math.max(0, sub + taxAmt - disc);
    const paid = Number(paidAmount) || 0;
    const pending = Math.max(0, grand - paid);

    let invStatus = status || 'Unpaid';
    if (paid >= grand && grand > 0) invStatus = 'Paid';
    else if (paid > 0 && paid < grand) invStatus = 'Partial';

    const invoice = await Invoice.create({
      company: req.user.companyId,
      invoiceNumber,
      invoiceDate: req.body.invoiceDate || new Date(),
      trip: trip || null,
      bilty: bilty || null,
      customerName,
      customerMobile,
      customerAddress,
      subtotal: sub,
      taxPercent: taxP,
      taxAmount: taxAmt,
      discount: disc,
      grandTotal: grand,
      paidAmount: paid,
      pendingAmount: pending,
      paymentMode: paymentMode || 'Cash',
      status: invStatus,
      notes,
    });

    res.status(201).json({ invoice });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.companyId })
      .populate('trip')
      .populate('bilty');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    const company = await Company.findById(req.user.companyId);
    res.json({ invoice, company });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    const fields = [
      'customerName', 'customerMobile', 'customerAddress', 'paymentMode', 'notes', 'invoiceDate'
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) invoice[f] = req.body[f];
    });

    if (req.body.subtotal !== undefined || req.body.taxPercent !== undefined || req.body.discount !== undefined || req.body.paidAmount !== undefined) {
      const sub = req.body.subtotal !== undefined ? Number(req.body.subtotal) : invoice.subtotal;
      const taxP = req.body.taxPercent !== undefined ? Number(req.body.taxPercent) : invoice.taxPercent;
      const disc = req.body.discount !== undefined ? Number(req.body.discount) : invoice.discount;
      const paid = req.body.paidAmount !== undefined ? Number(req.body.paidAmount) : invoice.paidAmount;

      const taxAmt = Math.round((sub * taxP) / 100);
      const grand = Math.max(0, sub + taxAmt - disc);
      const pending = Math.max(0, grand - paid);

      invoice.subtotal = sub;
      invoice.taxPercent = taxP;
      invoice.taxAmount = taxAmt;
      invoice.discount = disc;
      invoice.grandTotal = grand;
      invoice.paidAmount = paid;
      invoice.pendingAmount = pending;

      if (paid >= grand && grand > 0) invoice.status = 'Paid';
      else if (paid > 0 && paid < grand) invoice.status = 'Partial';
      else invoice.status = req.body.status || invoice.status;
    }

    await invoice.save();
    res.json({ invoice });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await Invoice.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Invoice not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
