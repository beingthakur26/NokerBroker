import Link from "next/link";
import { notFound } from "next/navigation";
import { VerifiedStamp } from "../../../../components/verified-stamp";

const properties: Record<string, { price: string; title: string; locality: string; area: string; floor: string; furnishing: string; description: string }> = {
  "chembur-2-bhk-115-cr": { price: "₹1.15 Cr", title: "2 BHK apartment", locality: "Chembur, Mumbai", area: "820 sqft", floor: "4th floor", furnishing: "Semi-furnished", description: "Verified 2 BHK apartment with direct owner contact and no brokerage." },
  "malad-west-1-bhk-62-l": { price: "₹62 L", title: "1 BHK apartment", locality: "Malad West, Mumbai", area: "510 sqft", floor: "2nd floor", furnishing: "Unfurnished", description: "Compact 1 BHK listing in Malad West with verified ownership details." },
  "bandra-west-3-bhk-235-cr": { price: "₹2.35 Cr", title: "3 BHK apartment", locality: "Bandra West, Mumbai", area: "1,240 sqft", floor: "9th floor", furnishing: "Furnished", description: "Furnished 3 BHK apartment in Bandra West, listed directly without a broker." },
  "powai-2-bhk-140-cr": { price: "₹1.4 Cr", title: "2 BHK apartment", locality: "Powai, Mumbai", area: "900 sqft", floor: "7th floor", furnishing: "Semi-furnished", description: "Verified Powai apartment with direct owner communication." },
  "thane-west-1-bhk-85-l": { price: "₹85 L", title: "1 BHK apartment", locality: "Thane West", area: "620 sqft", floor: "5th floor", furnishing: "Furnished", description: "Furnished 1 BHK in Thane West with direct owner contact." },
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ propertySlug: string }> }) {
  const { propertySlug } = await params;
  const property = properties[propertySlug];
  if (!property) notFound();

  return (
    <main className="section">
      <div className="wrap">
        <Link className="link-more" href="/buy">← Back to listings</Link>
        <div className="receipt" style={{ marginTop: 24, overflow: "visible" }}>
          <div className="prop-media facade" style={{ height: 300, borderRadius: "20px 20px 0 0" }}>
            <div className="roofline" />
            <div className="windows">{Array.from({ length: 15 }, (_, i) => <i key={i} className={i % 3 === 0 ? "lit" : ""} />)}</div>
            <VerifiedStamp />
          </div>
          <div style={{ padding: 32 }}>
            <p className="eyebrow">Verified listing</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, margin: "8px 0" }}>{property.title}</h1>
            <p className="prop-loc" style={{ fontSize: 15 }}>{property.locality}</p>
            <div className="prop-price" style={{ fontSize: 28 }}>{property.price}</div>
            <div className="prop-meta" style={{ marginTop: 20 }}><span><b>{property.area}</b></span><span><b>{property.floor}</b></span><span><b>{property.furnishing}</b></span></div>
            <p style={{ maxWidth: 680, color: "var(--ink-soft)", marginBottom: 24 }}>{property.description}</p>
            <div className="prop-actions" style={{ maxWidth: 520 }}>
              <a className="btn btn-whatsapp" href="https://wa.me/919999999999">WhatsApp owner</a>
              <Link className="btn btn-ghost" href="/login">Login to save</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
