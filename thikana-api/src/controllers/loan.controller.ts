import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { LoanApplication } from "../models/LoanApplication";
import { AuthedRequest } from "../middleware/auth.middleware";
import { applyLoanSchema } from "../validation/favorite.validation";

function toId(value: string) {
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
}

export async function applyForLoan(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = applyLoanSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const listingId = parsed.data.listingId ? toId(parsed.data.listingId) : undefined;

    const loan = await LoanApplication.create({
      userId: req.user!.userId,
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
  } catch (err) {
    next(err);
  }
}

export async function getMyLoans(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const loans = await LoanApplication.find({ userId: req.user!.userId })
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
  } catch (err) {
    next(err);
  }
}
