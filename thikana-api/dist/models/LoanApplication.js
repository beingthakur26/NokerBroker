"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanApplication = void 0;
const mongoose_1 = require("mongoose");
const loanApplicationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Listing" },
    propertyPrice: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    tenureYears: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    monthlyIncome: { type: Number, required: true },
    employmentType: {
        type: String,
        enum: ["SALARIED", "SELF_EMPLOYED", "BUSINESS"],
        required: true,
    },
    status: {
        type: String,
        enum: ["APPLIED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
        default: "APPLIED",
    },
}, { timestamps: true });
loanApplicationSchema.index({ userId: 1 });
exports.LoanApplication = (0, mongoose_1.model)("LoanApplication", loanApplicationSchema);
