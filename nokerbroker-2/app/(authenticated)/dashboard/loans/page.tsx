import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Loans",
  description: "Your home-loan tracker — applications opening soon.",
};

export default async function DashboardLoansPage() {
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

      <div className="dash-note">
        Home-loan applications are opening soon. Your application and status tracker will live here
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
