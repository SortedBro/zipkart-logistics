const express = require('express');
const Loan = require('../models/Loan');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const loans = await Loan.find({ company: req.user.companyId })
      .populate('truck', 'number type')
      .sort({ createdAt: -1 });
    res.json({ loans });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      truck,
      bankName,
      accountNumber,
      loanAmount,
      downPayment,
      interestRate,
      interestType,
      installmentsMonths,
      emiAmount,
      startDate,
      endDate,
      emiDeductionDay,
      status,
      notes,
    } = req.body;

    if (!truck || !bankName || !loanAmount || !installmentsMonths || !emiAmount) {
      return res.status(400).json({ error: 'Truck, bank name, loan amount, installments, and EMI amount are required.' });
    }

    const principal = Number(loanAmount);
    const down = Number(downPayment) || 0;
    const initialPending = Math.max(0, principal - down);

    const loan = await Loan.create({
      company: req.user.companyId,
      truck,
      bankName,
      accountNumber,
      loanAmount: principal,
      downPayment: down,
      interestRate: Number(interestRate) || 0,
      interestType: interestType || 'Fixed',
      installmentsMonths: Number(installmentsMonths),
      emiAmount: Number(emiAmount),
      installmentsPaid: 0,
      paidAmountTotal: down,
      pendingBalance: initialPending,
      startDate: startDate || null,
      endDate: endDate || null,
      emiDeductionDay: emiDeductionDay ? Number(emiDeductionDay) : 5,
      status: status || 'Active',
      notes,
    });

    res.status(201).json({ loan });
  })
);

router.post(
  '/:id/pay-emi',
  requireAuth,
  asyncHandler(async (req, res) => {
    const loan = await Loan.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!loan) return res.status(404).json({ error: 'Loan not found.' });

    const emi = Number(req.body.amount) || loan.emiAmount;
    loan.installmentsPaid += 1;
    loan.paidAmountTotal += emi;
    loan.pendingBalance = Math.max(0, loan.pendingBalance - emi);

    if (loan.pendingBalance === 0 || loan.installmentsPaid >= loan.installmentsMonths) {
      loan.status = 'Closed';
    }

    await loan.save();
    res.json({ loan });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await Loan.deleteOne({ _id: req.params.id, company: req.user.companyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Loan not found.' });
    res.json({ success: true });
  })
);

module.exports = router;
