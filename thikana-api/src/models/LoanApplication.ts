import { Schema, model } from "mongoose";

const loanApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
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
  },
  { timestamps: true }
);

loanApplicationSchema.index({ userId: 1 });

export const LoanApplication = model("LoanApplication", loanApplicationSchema);
