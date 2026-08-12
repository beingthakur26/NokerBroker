import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home loans — plan before you buy",
  description:
    "Understand your EMI before you shortlist. Use the EMI calculator, check what lenders look for, and apply when home-loan applications open.",
};

export default function LoansPage() {
  return (
    <main className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Home loans · No pushy agents</p>
            <h1 className="buy-title">Plan your loan, then your purchase.</h1>
            <p>
              Work out your monthly EMI against the listing you like, understand what lenders check,
              and apply directly with the numbers pre-filled.
            </p>
          </div>
          <Link className="btn btn-primary" href="/emi-calculator">
            Open EMI calculator
          </Link>
        </div>

        <div className="steps" style={{ marginTop: 40 }}>
          {[
            ["01", "Pick a price range", "Search by budget on /buy — every card already shows the price you'd pay."],
            ["02", "Know your EMI", "Open the EMI calculator, set the loan amount and tenure, and see the exact monthly figure."],
            ["03", "Check eligibility", "Lenders look at income, existing EMIs and your credit score. Keep monthly EMI under ~40% of take-home."],
            ["04", "Apply when ready", "Home-loan applications are opening soon — carry your numbers straight in, pre-filled from your shortlist."],
          ].map(([num, title, text]) => (
            <div className="step" key={num}>
              <span className="step-num">{num}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <section className="emi" style={{ marginTop: 48 }}>
          <div>
            <p className="eyebrow emi-eyebrow">EMI calculator</p>
            <h2>Know your monthly<br />before you shortlist.</h2>
            <p>Adjust the loan amount and tenure and see your EMI instantly — no login needed.</p>
            <Link className="btn btn-primary" href="/emi-calculator">Open full calculator</Link>
          </div>
        </section>

        <div className="dash-note" style={{ marginTop: 48 }}>
          Full home-loan applications are coming next. Your dashboard has a dedicated Loans section
          where your application and status tracker will live.
        </div>
      </div>
    </main>
  );
}
