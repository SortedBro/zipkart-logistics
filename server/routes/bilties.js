const express = require('express');
const Bilty = require('../models/Bilty');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

async function nextLrNumber(companyId) {
  const count = await Bilty.countDocuments({ company: companyId });
  return `ZIL-${String(count + 1).padStart(5, '0')}`;
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const bilties = await Bilty.find({ company: req.user.companyId })
      .sort({ createdAt: -1 })
      .populate('party', 'name')
      .populate('truck', 'number');
    res.json({ bilties });
  })
);

router.get(
  '/next-lr',
  requireAuth,
  asyncHandler(async (req, res) => {
    const lr = await nextLrNumber(req.user.companyId);
    res.json({ lrNumber: lr });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      lr_number,
      bilty_date,
      party_id,
      truck_id,
      consignor,
      consignee,
      paidBy,
      from_city,
      to_city,
      shipmentMode,
      vehicleSize,
      driverName,
      ewayBillNo,
      ewayBillExpiry,
      containerNo,
      material,
      packingType,
      quantity,
      weight,
      invoiceNumber,
      invoiceDate,
      hsnCode,
      valueOfGoods,
      privateMark,
      insured,
      freight,
      advance,
      other_charges,
      actualWeight,
      chargedWeight,
      rateType,
      cgstPercent,
      sgstPercent,
      igstPercent,
      tax,
      paymentType,
      gstPaidBy,
    } = req.body;

    if (!party_id || !bilty_date) return res.status(400).json({ error: 'Party and date are required.' });

    const freightNum = parseFloat(freight) || 0;
    const otherChargesNum = parseFloat(other_charges) || 0;
    const cgst = parseFloat(cgstPercent) || 0;
    const sgst = parseFloat(sgstPercent) || 0;
    const igst = parseFloat(igstPercent) || 0;
    const taxNum = parseFloat(tax) || 0;
    // Display total only — does NOT affect the ledger/P&L, which use freight/otherCharges/advance.
    const gstAmount = (freightNum * (cgst + sgst + igst)) / 100;
    const biltyAmount = freightNum + otherChargesNum + gstAmount + taxNum;

    const bilty = await Bilty.create({
      company: req.user.companyId,
      lrNumber: lr_number || (await nextLrNumber(req.user.companyId)),
      biltyDate: bilty_date,
      party: party_id,
      truck: truck_id || undefined,
      consignor,
      consignee,
      paidBy,
      fromCity: from_city,
      toCity: to_city,
      shipmentMode: shipmentMode || 'Road',
      vehicleSize,
      driverName,
      ewayBillNo,
      ewayBillExpiry,
      containerNo,
      material,
      packingType,
      quantity: quantity !== undefined && quantity !== '' ? Number(quantity) : undefined,
      weight: parseFloat(weight) || undefined,
      invoiceNumber,
      invoiceDate,
      hsnCode,
      valueOfGoods: valueOfGoods !== undefined && valueOfGoods !== '' ? Number(valueOfGoods) : undefined,
      privateMark,
      insured: Boolean(insured),
      freight: freightNum,
      advance: parseFloat(advance) || 0,
      otherCharges: otherChargesNum,
      actualWeight: actualWeight !== undefined && actualWeight !== '' ? Number(actualWeight) : undefined,
      chargedWeight: chargedWeight !== undefined && chargedWeight !== '' ? Number(chargedWeight) : undefined,
      rateType: rateType || 'FIXED',
      cgstPercent: cgst,
      sgstPercent: sgst,
      igstPercent: igst,
      tax: taxNum,
      biltyAmount,
      paymentType: paymentType || 'To Be Billed',
      gstPaidBy: gstPaidBy || 'Transporter',
      createdBy: req.user.id,
    });

    res.status(201).json({ bilty });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const bilty = await Bilty.findOne({ _id: req.params.id, company: req.user.companyId })
      .populate('party', 'name phone address')
      .populate('truck', 'number driverName');
    if (!bilty) return res.status(404).json({ error: 'Bilty not found.' });

    const balance = bilty.freight + bilty.otherCharges - bilty.advance;
    res.json({ bilty, balance });
  })
);

router.patch(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const bilty = await Bilty.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      { status },
      { new: true, runValidators: true }
    );
    if (!bilty) return res.status(404).json({ error: 'Bilty not found.' });
    res.json({ bilty });
  })
);

module.exports = router;
