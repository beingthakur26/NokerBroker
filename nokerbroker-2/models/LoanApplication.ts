// models/LoanApplication.ts
import { Schema, model, models, Types } from "mongoose";

const LoanApplicationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Types.ObjectId, ref: "Property" },
    loanAmount: { type: Number, required: true },
    tenureYears: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    monthlyIncome: { type: Number, required: true },
    employmentType: { type: String, required: true },
    existingLoans: { type: Number, default: 0 },
    panNumber: { type: String, required: true },
    documents: [{ type: String }],
    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"],
      default: "SUBMITTED",
    },
  },
  { timestamps: true }
);

LoanApplicationSchema.index({ userId: 1, createdAt: -1 });

export default models.LoanApplication || model("LoanApplication", LoanApplicationSchema);
