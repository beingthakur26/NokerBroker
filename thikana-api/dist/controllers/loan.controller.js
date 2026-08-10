"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyForLoan = applyForLoan;
exports.getMyLoans = getMyLoans;
const mongoose_1 = require("mongoose");
const LoanApplication_1 = require("../models/LoanApplication");
const favorite_validation_1 = require("../validation/favorite.validation");
function toId(value) {
    return mongoose_1.Types.ObjectId.isValid(value) ? new mongoose_1.Types.ObjectId(value) : null;
}
async function applyForLoan(req, res, next) {
    try {
        const parsed = favorite_validation_1.applyLoanSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.issues[0].message });
        const listingId = parsed.data.listingId ? toId(parsed.data.listingId) : undefined;
        const loan = await LoanApplication_1.LoanApplication.create({
            userId: req.user.userId,
            listingId,
            propertyPrice: parsed.data.propertyPrice,
            loanAmount: parsed.data.loanAmount,
            tenureYears: parsed.data.tenureYears,
            interestRate: parsed.data.interestRate,
            monthlyIncome: parsed.data.monthlyIncome,
            employmentType: parsed.data.employmentType,
            status: "APPLIED",
        });
        res.status(201).json({ loan: { id: loan._id.toString(), status: loan.status } });
    }
    catch (err) {
        next(err);
    }
}
async function getMyLoans(req, res, next) {
    try {
        const loans = await LoanApplication_1.LoanApplication.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            loans: loans.map((loan) => ({
                id: loan._id.toString(),
                propertyPrice: loan.propertyPrice,
                loanAmount: loan.loanAmount,
                tenureYears: loan.tenureYears,
                interestRate: loan.interestRate,
                monthlyIncome: loan.monthlyIncome,
                employmentType: loan.employmentType,
                status: loan.status,
                createdAt: loan.createdAt,
            })),
        });
    }
    catch (err) {
        next(err);
    }
}
