import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import LoanApplication from "@/models/LoanApplication";
import { serializeDocs } from "@/lib/serialize";
import { LoanApplicationForm } from "@/components/loan-application-form";

export const metadata: Metadata = {
  title: "Loans",
  description: "Your home-loan tracker — applications opening soon.",
};

export default async function DashboardLoansPage() {
  const session = await auth();
  await dbConnect();
  const applications = serializeDocs(
    await LoanApplication.find({ userId: session?.user?.id }).sort({ createdAt: -1 }).lean()
  ) as unknown as { _id: string; loanAmount: number; status: string; createdAt: string }[];
  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Loans
          </h1>
        </div>
      </div>

      <LoanApplicationForm />

      <section className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="font-bold text-ink">Your applications</h2>
        {applications.length ? <div className="mt-3 space-y-2">{applications.map((loan) => <div key={loan._id} className="flex items-center justify-between border-t border-border pt-3 text-sm"><span>₹{loan.loanAmount.toLocaleString("en-IN")} · {new Date(loan.createdAt).toLocaleDateString("en-IN")}</span><strong className="text-orange">{loan.status.replaceAll("_", " ")}</strong></div>)}</div> : <p className="mt-2 text-sm text-ink-soft">No applications submitted yet.</p>}
      </section>

      <div className="dash-note">
        Track each loan application from submission through disbursement.
        — Submitted → Under review → Approved/Rejected → Disbursed.
      </div>

      <div className="dash-actions">
        <Link className="dash-action" href="/emi-calculator">
          <div>
            <strong>EMI calculator</strong>
            <span>Work out your monthly payment before you shortlist.</span>
          </div>
        </Link>
        <Link className="dash-action" href="/loans">
          <div>
            <strong>How home loans work</strong>
            <span>Understand eligibility, EMI and what lenders check.</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
