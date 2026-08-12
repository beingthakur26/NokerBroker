import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Answers to the most common NokerBroker questions.",
};

export default function HelpPage() {
  const faqs = [
    ["Is NokerBroker really free?", "Yes. Listing costs nothing and we never take a brokerage. Buyers and sellers talk to each other directly."],
    ["How are listings verified?", "Every listing has an owner-verified WhatsApp number and an ownership document on file. Look for the green Verified stamp."],
    ["How do I buy a home?", "Search on /buy, shortlist the homes you like, send an enquiry or WhatsApp the owner directly. No broker in between."],
    ["How do I sell my property?", "Go to Dashboard → List a property, add your details and ownership document, and your listing goes live immediately."],
    ["What is a RERA-verified project?", "Projects with a valid Maharashtra RERA number. We show the RERA number on every project listing."],
    ["How do I report a problem?", "Visit /report-listing or reach us on WhatsApp — we review reports the same day."],
  ];
  return (
    <main className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Help centre</p>
            <h1 className="buy-title">How can we help?</h1>
            <p>Quick answers to the questions we hear most.</p>
          </div>
        </div>
        <div className="steps">
          {faqs.map(([q, a], index) => (
            <div className="step" key={q}>
              <span className="step-num">Q{index + 1}</span>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>
        <div className="dash-note" style={{ marginTop: 40 }}>
          Still stuck? <Link className="link-more" href="/contact">WhatsApp us</Link> — a real human replies.
        </div>
      </div>
    </main>
  );
}
