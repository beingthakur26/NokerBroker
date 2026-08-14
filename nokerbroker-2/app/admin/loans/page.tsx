// app/admin/loans/page.tsx
import React from "react";
import dbConnect from "@/lib/mongodb";
import LoanApplication from "@/models/LoanApplication";
import User from "@/models/User";
import { serializeDocs } from "@/lib/serialize";
import { AdminLoanRow } from "@/components/admin-loan-row";

interface AdminLoan {
  _id: string;
  loanAmount: number;
  tenureYears: number;
  monthlyIncome: number;
  status: string;
  userId?: { name?: string; whatsappNumber?: string };
}

export default async function AdminLoansPage() {
  await dbConnect();
  const rawLoans = await LoanApplication.find()
    .populate({ path: "userId", model: User, select: "name email whatsappNumber" })
    .sort({ createdAt: -1 })
    .lean();

  const loans = serializeDocs(rawLoans) as unknown as AdminLoan[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Home Loan Applications & Bank Lead Routing</h1>
        <p className="text-sm text-ink-soft">Review user loan submissions and route leads to partner banks/NBFCs.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg-warm text-xs text-ink-soft uppercase">
              <th className="p-4 font-semibold">Applicant</th>
              <th className="p-4 font-semibold">Loan Amount</th>
              <th className="p-4 font-semibold">Tenure</th>
              <th className="p-4 font-semibold">Monthly Income</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Update</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-ink-soft">
                  No home loan applications submitted yet.
                </td>
              </tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan._id} className="border-b border-border text-sm">
                  <td className="p-4">
                    <p className="font-bold text-ink">{loan.userId?.name || "User"}</p>
                    <p className="text-xs text-ink-soft">{loan.userId?.whatsappNumber}</p>
                  </td>
                  <td className="p-4 font-bold text-orange">₹{loan.loanAmount?.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-ink-soft">{loan.tenureYears} Years</td>
                  <td className="p-4 text-ink font-medium">₹{loan.monthlyIncome?.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <span className="inline-block bg-orange-pale text-orange text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {loan.status}
                    </span>
                  </td>
                  <td className="p-4"><AdminLoanRow id={loan._id} status={loan.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
