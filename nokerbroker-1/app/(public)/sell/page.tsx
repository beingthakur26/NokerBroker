import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell your property — zero brokerage",
  description:
    "List your flat or house on NokerBroker in minutes. Your ownership document goes on file, your listing goes live immediately, and buyers message you directly. Zero brokerage.",
};

export default function SellPage() {
  return (
    <main className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Zero brokerage · Direct buyers</p>
            <h1 className="buy-title">Sell your property, keep the 2%.</h1>
            <p>
              List your flat, house or plot in minutes. Your ownership document goes on file,
              your listing goes live immediately, and buyers message you directly on WhatsApp.
            </p>
          </div>
          <Link className="btn btn-primary" href="/dashboard/listings/new">
            List your property
          </Link>
        </div>

        <div className="steps" style={{ marginTop: 40 }}>
          {[
            ["01", "List in minutes", "Tell us the type, location, price and size. Upload a photo and your ownership document — that's what makes you verified."],
            ["02", "Go live instantly", "No approval queue. Your listing is live the moment you submit, visible to every buyer searching your locality."],
            ["03", "Buyers message you", "Serious buyers enquire through the site and reach you on WhatsApp directly. No broker in the thread."],
            ["04", "Close brokerage-free", "You keep 100% of the sale price. Verify the buyer yourself, just like you would face-to-face."],
          ].map(([num, title, text]) => (
            <div className="step" key={num}>
              <span className="step-num">{num}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <section className="section alt" style={{ marginTop: 48 }}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2>What sellers ask us</h2>
              </div>
            </div>
            <div className="steps">
              {[
                ["Is it really free?", "Yes. Listing costs nothing, and we never take a commission. Your only cost is the WhatsApp message from an interested buyer."],
                ["What makes my listing verified?", "Your verified WhatsApp number plus an ownership document on file. Buyers see a green Verified stamp and trust the listing instantly."],
                ["Can I pause or remove my listing?", "Anytime, from your dashboard. Sold it off-platform? Mark it SOLD and it disappears from search immediately."],
                ["How do I talk to buyers?", "Every enquiry is recorded in your dashboard, and buyers can WhatsApp you directly. You choose how to respond."],
              ].map(([q, a], index) => (
                <div className="step" key={q}>
                  <span className="step-num">Q{index + 1}</span>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
