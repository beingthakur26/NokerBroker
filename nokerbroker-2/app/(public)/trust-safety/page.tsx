import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust and safety",
  description: "How NokerBroker protects direct property conversations.",
};

export default function TrustSafetyPage() {
  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Trust and safety</p>
        <h1 className="buy-title">Direct conversations, safer decisions.</h1>
        <p>Listings require an ownership document and a verified WhatsApp number. New projects require RERA and company documents, then an administrator&apos;s approval before publishing.</p>
        <h2>Stay safe</h2>
        <p>Never share an OTP, send an advance payment, or rely on a document without independently verifying it. Report suspicious listings through the Report a listing page.</p>
      </div>
    </main>
  );
}
