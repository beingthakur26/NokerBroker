import Link from "next/link";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { SearchBar } from "../../components/search-bar";
import { PropertyCard } from "../../components/property-card";
import { VerifiedStamp } from "../../components/verified-stamp";
import { EmiCalculatorWidget } from "../../components/emi-calculator-widget";

const properties = [
  { price: "₹1.15 Cr", title: "2 BHK apartment", locality: "Chembur, Mumbai", areaSqft: 820, floor: "4th", furnishing: "Semi-furnished" },
  { price: "₹62 L", title: "1 BHK apartment", locality: "Malad West, Mumbai", areaSqft: 510, floor: "2nd", furnishing: "Unfurnished" },
  { price: "₹2.35 Cr", title: "3 BHK apartment", locality: "Bandra West, Mumbai", areaSqft: "1,240", floor: "9th", furnishing: "Furnished" },
];

const projects = [
  ["Orchid Residency", "Powai, Mumbai · Ready to move", "₹1.3 Cr", "2, 3 BHK", "Ready"],
  ["Skyline Meridian", "Thane West · Under construction", "₹78 L", "1, 2 BHK", "Dec 2027"],
  ["Marine Crest Towers", "Chembur, Mumbai · Pre-launch", "₹1.9 Cr", "2, 3, 4 BHK", "Mar 2029"],
  ["Palm Court Residences", "Goregaon East · Under construction", "₹95 L", "1, 2 BHK", "Aug 2026"],
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow hero-eyebrow">Zero brokerage · Verified sellers</p>
            <h1>Mumbai apartments,<br /><em>no middlemen.</em></h1>
            <p className="sub">Search verified flats and new projects, and message owners or builders directly on WhatsApp. No broker fee, ever — on any listing.</p>
            <SearchBar />
            <div className="trust-row">
              <div className="trust-stat"><b>18,600</b><span>Verified listings</span></div>
              <div className="trust-stat"><b>₹0</b><span>Brokerage, always</span></div>
              <div className="trust-stat"><b>42,000</b><span>WhatsApp connects made</span></div>
            </div>
          </div>
          <div className="collage" aria-hidden="true">
            {["₹1.4 Cr · 2 BHK|Powai, Mumbai", "₹85 L · 1 BHK|Thane West", "₹2.1 Cr · 3 BHK|Bandra West"].map((item, index) => {
              const [title, location] = item.split("|");
              return <div key={item} className={`collage-card c${index + 1}`}><div className="facade"><div className="roofline" /><div className="windows">{Array.from({length:15},(_,i)=><i key={i} className={i%2===0 ? "lit" : ""}/>)}</div></div><div className="info"><b>{title}</b><span>{location}</span></div></div>;
            })}
            <VerifiedStamp />
          </div>
        </div>
      </header>

      <section className="zb" id="sell">
        <div className="wrap zb-grid"><div><h2>The broker fee<br />was never yours to pay.</h2><p>A typical Mumbai broker charges 1–2% of the deal on both sides. On a ₹90 L flat, that&apos;s real money — gone before you&apos;ve unpacked a box. We built NokerBroker so that fee stays in your pocket, on every listing, every time.</p></div><div className="receipt"><div className="receipt-row old"><span className="receipt-label">Traditional broker fee<br /><span className="receipt-label-sub">2% on a ₹90 L flat</span></span><span className="receipt-amount">₹1,80,000</span></div><div className="perforation" /><div className="receipt-row new"><span className="receipt-label">NokerBroker<br /><span className="receipt-label-sub">Direct owner contact, always</span></span><span className="receipt-amount">₹0</span></div></div></div>
      </section>

      <section className="section" id="buy"><div className="wrap"><div className="section-head"><div><h2>Verified listings, live now</h2><p>Every listing here has an owner-verified WhatsApp number and an ownership document on file.</p></div><Link className="link-more" href="/buy">View all listings →</Link></div><div className="prop-grid">{properties.map((property)=><PropertyCard key={property.title+property.locality} {...property} />)}</div></div></section>

      <section className="section alt" id="projects"><div className="wrap"><div className="section-head"><div><h2>New projects from RERA-verified builders</h2><p>Every builder profile is verified once — RERA number and company documents on file before any project goes live.</p></div><Link className="link-more" href="/projects">View all projects →</Link></div></div><div className="proj-row" role="list">{projects.map(([name,loc,price,units,pos])=><div className="proj-card" role="listitem" key={name}><span className="badge"><span className="dot"/>RERA verified</span><h3>{name}</h3><p className="loc">{loc}</p><div className="proj-stats"><div><span>Starting from</span><b>{price}</b></div><div><span>Unit types</span><b>{units}</b></div><div><span>Possession</span><b>{pos}</b></div></div></div>)}</div></section>

      <section className="section"><div className="wrap"><div className="section-head"><div><h2>How it works</h2><p>Four steps, no broker in between.</p></div></div><div className="steps">{[["01","Search and shortlist","Filter by locality, budget and BHK. Compare up to four listings side by side."],["02","Verified access","Every listing carries owner or builder verification — no ghost listings, no bait-and-switch."],["03","Connect on WhatsApp","Message the owner or builder directly. No broker in the thread, no broker in the deal."],["04","Move in, brokerage-free","Close the deal directly. Applying for a loan? Do it in the same place, pre-filled from the listing."]].map(([num,title,text])=><div className="step" key={num}><span className="step-num">{num}</span><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>

      <section className="section alt"><div className="wrap"><div className="section-head"><div><h2>Search by locality</h2><p>Mumbai&apos;s most-searched neighbourhoods, right now.</p></div></div><div className="loc-grid">{[["Andheri West","2,140"],["Powai","1,860"],["Thane West","3,020"],["Bandra West","1,240"],["Chembur","1,510"],["Goregaon East","1,380"],["Malad West","2,290"],["Vikhroli","860"]].map(([name,count])=><Link className="loc-tile" href={`/buy?locality=${encodeURIComponent(name)}`} key={name}><b>{name}</b><span>{count} listings</span></Link>)}</div></div></section>

      <section className="section"><div className="wrap"><div className="emi"><div><p className="eyebrow emi-eyebrow">EMI calculator</p><h2>Know your monthly<br />before you shortlist.</h2><p>Adjust the loan amount and see your EMI instantly — no login needed. Ready to apply? Carry the numbers straight into a loan application.</p><Link className="btn btn-primary" href="/emi-calculator">Open full calculator</Link></div><EmiCalculatorWidget /></div></div></section>

      <section className="section alt"><div className="wrap quote"><p>&quot;I listed my 2 BHK on a Friday and had three verified buyers messaging me on WhatsApp by Monday — no broker, no calls at odd hours, no 2% gone from my sale.&quot;</p><div className="quote-who"><div className="avatar">RK</div><div><b>Rohan Kulkarni</b><span>Sold a flat in Chembur, June 2026</span></div></div></div></section>
      <Footer />
    </>
  );
}
