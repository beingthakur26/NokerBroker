import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-logo">NokerBroker</div>
            <p>Mumbai&apos;s zero-brokerage marketplace for buying, selling and renting — every listing owner-verified, every conversation direct.</p>
          </div>
          <div className="foot-col">
            <h4>Explore</h4>
            <Link href="/buy">Buy</Link>
            <Link href="/projects">New Projects</Link>
            <Link href="/sell">Sell</Link>
            <Link href="/emi-calculator">EMI calculator</Link>
          </div>
          <div className="foot-col">
            <h4>Loans</h4>
            <Link href="/loans/apply">Apply for a loan</Link>
            <Link href="/loans/eligibility">Check eligibility</Link>
            <Link href="/loans/partners">Partner banks</Link>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/trust-safety">Trust and safety</Link>
            <Link href="/careers">Careers</Link>
          </div>
          <div className="foot-col">
            <h4>Support</h4>
            <Link href="/help">Help centre</Link>
            <Link href="/contact">WhatsApp us</Link>
            <Link href="/report-listing">Report a listing</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 NokerBroker. All rights reserved.</span>
          <span>Made for Mumbai, brokerage-free.</span>
        </div>
      </div>
    </footer>
  );
}
