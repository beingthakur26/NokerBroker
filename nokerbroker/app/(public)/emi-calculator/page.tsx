import Link from "next/link";
import { EmiCalculatorWidget } from "../../../components/emi-calculator-widget";

export default function EmiCalculatorPage() {
  return (
    <main className="section">
      <div className="wrap">
        <Link className="link-more" href="/">← Back home</Link>
        <div className="section-head" style={{ marginTop: 24 }}>
          <div>
            <p className="eyebrow">EMI calculator</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 46, marginTop: 8 }}>Know your monthly before you shortlist.</h1>
            <p>Adjust loan amount, tenure and interest rate. Your monthly EMI updates instantly.</p>
          </div>
        </div>
        <div className="emi">
          <div>
            <h2>Plan the payment, then pick the property.</h2>
            <p>Use this estimate to understand affordability before contacting an owner or builder.</p>
            <Link className="btn btn-primary" href="/buy">Browse properties</Link>
          </div>
          <EmiCalculatorWidget />
        </div>
      </div>
    </main>
  );
}
