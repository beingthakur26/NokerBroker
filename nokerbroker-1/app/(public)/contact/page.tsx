import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach the NokerBroker team on WhatsApp or email.",
};

export default function ContactPage() {
  return (
    <main className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="buy-title">Talk to a human.</h1>
            <p>We reply on WhatsApp the same day.</p>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-num">WA</span>
            <h3>WhatsApp</h3>
            <p>Message us on WhatsApp and get a reply the same day.</p>
            <a
              className="btn btn-whatsapp"
              href="https://wa.me/919000000001?text=Hi%20NokerBroker%2C%20I%20have%20a%20question."
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
          <div className="step">
            <span className="step-num">@</span>
            <h3>Email</h3>
            <p>For documents and account issues, email us and we&apos;ll follow up within one working day.</p>
            <a className="link-more" href="mailto:hello@nokerbroker.com">hello@nokerbroker.com</a>
          </div>
          <div className="step">
            <span className="step-num">!</span>
            <h3>Report a listing</h3>
            <p>Spotted something that doesn&apos;t look right? Flag it and we&apos;ll review it today.</p>
            <Link className="btn btn-ghost" href="/report-listing">Report a listing</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
