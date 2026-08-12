import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { PropertyCard } from "@/components/property-card";
import { PropertyImage } from "@/components/property-image";
import { VerifiedStamp } from "@/components/verified-stamp";
import { EmiCalculatorWidget } from "@/components/emi-calculator-widget";
import { getLiveProperties } from "@/lib/properties-db";
import { getLiveProjects } from "@/lib/projects-db";

export default async function HomePage() {
  const listings = await getLiveProperties();
  const projects = await getLiveProjects();
  const heroListings = listings.slice(0, 3);

  return (
    <>
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow hero-eyebrow">Zero brokerage · Verified sellers</p>
            <h1>Mumbai apartments,<br /><em>no middlemen.</em></h1>
            <p className="sub">Search verified flats and new projects, and message owners or builders directly on WhatsApp. No broker fee, ever — on any listing.</p>
            <SearchBar />
            <div className="trust-row">
              <div className="trust-stat"><b>{listings.length.toLocaleString("en-IN")}+</b><span>Verified listings</span></div>
              <div className="trust-stat"><b>₹0</b><span>Brokerage, always</span></div>
              <div className="trust-stat"><b>42,000</b><span>WhatsApp connects made</span></div>
            </div>
          </div>
          <div className="collage" aria-hidden="true">
            {heroListings.map((property, index) => (
              <div key={property.slug} className={`collage-card c${index + 1}`}>
                <PropertyImage imageUrl={property.images[0]} alt={property.title} priority={index === 0} />
                <div className="collage-fade" />
                <div className="info">
                  <b>{property.title}</b>
                  <span>{property.locality}</span>
                </div>
              </div>
            ))}
            <VerifiedStamp />
          </div>
        </div>
      </header>

      <section className="zb" id="sell">
        <div className="wrap zb-grid">
          <div>
            <h2>The broker fee<br />was never yours to pay.</h2>
            <p>A typical Mumbai broker charges 1–2% of the deal on both sides. On a ₹90 L flat, that&apos;s real money — gone before you&apos;ve unpacked a box. We built NokerBroker so that fee stays in your pocket, on every listing, every time.</p>
          </div>
          <div className="receipt">
            <div className="receipt-row old">
              <span className="receipt-label">Traditional broker fee<br /><span className="receipt-label-sub">2% on a ₹90 L flat</span></span>
              <span className="receipt-amount">₹1,80,000</span>
            </div>
            <div className="perforation" />
            <div className="receipt-row new">
              <span className="receipt-label">NokerBroker<br /><span className="receipt-label-sub">Direct owner contact, always</span></span>
              <span className="receipt-amount">₹0</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="buy">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Verified listings, live now</h2>
              <p>Every listing here has an owner-verified WhatsApp number and an ownership document on file.</p>
            </div>
            <Link className="link-more" href="/buy">View all listings →</Link>
          </div>
          {heroListings.length ? (
            <div className="prop-grid">
              {heroListings.map((property, index) => (
                <PropertyCard
                  key={property.slug}
                  property={property}
                  detailsHref={`/buy/${property.slug}`}
                  imagePriority={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No listings yet</h2>
              <p>Be the first — list your flat and connect with buyers directly.</p>
              <Link className="btn btn-primary" href="/dashboard/listings/new">List your property</Link>
            </div>
          )}
        </div>
      </section>

      <section className="section alt" id="projects">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>New projects from RERA-verified builders</h2>
              <p>Every builder profile is verified once — RERA number and company documents on file before any project goes live.</p>
            </div>
            <Link className="link-more" href="/projects">View all projects →</Link>
          </div>
          <div className="proj-row" role="list">
            {projects.slice(0, 4).map((project) => (
              <Link className="proj-card" role="listitem" key={project.slug} href={`/projects/${project.slug}`}>
                <span className="badge"><span className="dot" />RERA verified</span>
                <h3>{project.name}</h3>
                <p className="loc">{project.locality}</p>
                <div className="proj-stats">
                  <div><span>Starting from</span><b>{formatProjectPrice(project.units)}</b></div>
                  <div><span>Unit types</span><b>{project.units.map((unit) => unit.unitType).join(", ") || "—"}</b></div>
                  <div><span>Possession</span><b>{project.constructionStatus === "READY_TO_MOVE" ? "Ready" : formatPossession(project.possessionDate)}</b></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>How it works</h2>
              <p>Four steps, no broker in between.</p>
            </div>
          </div>
          <div className="steps">
            {[
              ["01", "Search and shortlist", "Filter by locality, budget and BHK. Save the homes you like to your dashboard."],
              ["02", "Verified access", "Every listing carries owner or builder verification — no ghost listings, no bait-and-switch."],
              ["03", "Connect on WhatsApp", "Message the owner or builder directly. No broker in the thread, no broker in the deal."],
              ["04", "Move in, brokerage-free", "Close the deal directly. Applying for a loan? Use the EMI calculator to plan first."],
            ].map(([num, title, text]) => (
              <div className="step" key={num}>
                <span className="step-num">{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Search by locality</h2>
              <p>Mumbai&apos;s most-searched neighbourhoods, right now.</p>
            </div>
          </div>
          <div className="loc-grid">
            {[
              "Andheri West",
              "Powai",
              "Thane West",
              "Bandra West",
              "Chembur",
              "Goregaon East",
              "Malad West",
              "Vikhroli",
            ].map((name) => (
              <Link className="loc-tile" href={`/buy?locality=${encodeURIComponent(name)}`} key={name}>
                <b>{name}</b>
                <span>{listings.filter((listing) => listing.locality.toLowerCase().includes(name.toLowerCase())).length} listings</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="emi">
            <div>
              <p className="eyebrow emi-eyebrow">EMI calculator</p>
              <h2>Know your monthly<br />before you shortlist.</h2>
              <p>Adjust the loan amount and see your EMI instantly — no login needed.</p>
              <Link className="btn btn-primary" href="/emi-calculator">Open full calculator</Link>
            </div>
            <EmiCalculatorWidget />
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap quote">
          <p>&quot;I listed my 2 BHK on a Friday and had three verified buyers messaging me on WhatsApp by Monday — no broker, no calls at odd hours, no 2% gone from my sale.&quot;</p>
          <div className="quote-who">
            <div className="avatar">RK</div>
            <div>
              <b>Rohan Kulkarni</b>
              <span>Sold a flat in Chembur, June 2026</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function formatProjectPrice(units: { priceFrom: number }[]): string {
  if (!units.length) return "—";
  const min = Math.min(...units.map((unit) => unit.priceFrom));
  return `₹${(min / 1_00_000).toFixed(min >= 1_00_00_000 ? 1 : 0)}L`;
}

function formatPossession(date?: string): string {
  if (!date) return "TBA";
  const parsed = new Date(date);
  const month = parsed.toLocaleString("en-IN", { month: "short" });
  return `${month} ${parsed.getFullYear()}`;
}
