import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report a listing",
  description: "Flag a suspicious or fraudulent listing on NokerBroker.",
};

export default function ReportListingPage() {
  return (
    <main className="section" style={{ paddingTop: 48 }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Trust and safety</p>
            <h1 className="buy-title">Report a listing</h1>
            <p>
              See something that looks like a scam, a duplicate photo, or a listing that breaks the
              rules? Flag it and our team reviews it the same day.
            </p>
          </div>
        </div>

        <div className="receipt" style={{ padding: 28 }}>
          <p className="eyebrow">What to include</p>
          <ul style={{ color: "var(--ink-soft)", lineHeight: 1.8, margin: "12px 0 24px", paddingLeft: 18 }}>
            <li>The listing&apos;s web address (URL) or title</li>
            <li>What looked wrong — price too good, odd photos, pressure to pay upfront</li>
            <li>Your contact details so we can follow up</li>
          </ul>
          <a
            className="btn btn-whatsapp"
            style={{ width: "100%", justifyContent: "center" }}
            href="https://wa.me/919000000001?text=Hi%20NokerBroker%2C%20I%20want%20to%20report%20a%20listing."
            target="_blank"
            rel="noopener noreferrer"
          >
            Report on WhatsApp
          </a>
          <a
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center", marginTop: 10, border: "1px solid var(--border)" }}
            href="mailto:safety@nokerbroker.com?subject=Report%20a%20listing"
          >
            Report by email
          </a>
          <p style={{ marginTop: 18, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
            Never send money or OTPs to anyone you met through a listing.
            NokerBroker never asks buyers for payments.
          </p>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
          Questions first? Read the <Link className="link-more" href="/help">help centre</Link>.
        </p>
      </div>
    </main>
  );
}
