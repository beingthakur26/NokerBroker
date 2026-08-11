import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  formatArea,
  formatINR,
  formatPrice,
  getPropertyBySlug,
  getRelatedProperties,
} from "@/lib/properties";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyCard } from "@/components/property-card";
import { SaveButton } from "@/components/save-button";
import { VerifiedStamp } from "@/components/verified-stamp";

function estimateEmi(priceValue: number): number {
  const loan = priceValue * 0.8;
  const monthlyRate = 0.085 / 12;
  const months = 240;
  return (
    (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}): Promise<Metadata> {
  const { propertySlug } = await params;
  const property = getPropertyBySlug(propertySlug);
  if (!property) return { title: "Property not found" };
  return {
    title: `${property.title} in ${property.locality}`,
    description: property.description,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = getPropertyBySlug(propertySlug);
  if (!property) notFound();

  const related = getRelatedProperties(property);
  const emi = estimateEmi(property.priceValue);
  const waHref = `https://wa.me/${property.ownerWhatsapp}?text=${encodeURIComponent(
    `Hi ${property.ownerName}, I'm interested in the ${property.title} at ${property.locality} listed on NokerBroker (${formatPrice(property.priceValue)}). Could we talk?`
  )}`;

  return (
    <main className="section">
      <div className="wrap">
        <Link className="link-more" href="/buy">← Back to listings</Link>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-head">
              <div>
                <p className="eyebrow">Verified listing</p>
                <h1 className="detail-title">{property.title}</h1>
                <p className="prop-loc" style={{ fontSize: 15 }}>{property.locality}</p>
              </div>
              <div className="detail-stamp" aria-hidden="true">
                <VerifiedStamp />
              </div>
            </div>

            <PropertyGallery images={property.images} title={property.title} />

            <section className="detail-block">
              <h2>About this property</h2>
              <p className="detail-desc">{property.description}</p>
              <div className="detail-facts">
                <div><span>Area</span><b>{formatArea(property.areaSqft)}</b></div>
                <div><span>Configuration</span><b>{property.bhk} BHK</b></div>
                <div><span>Floor</span><b>{property.floor}</b></div>
                <div><span>Furnishing</span><b>{property.furnishing}</b></div>
              </div>
            </section>
          </div>

          <aside className="detail-side">
            <div className="detail-card">
              <div className="detail-price">{formatPrice(property.priceValue)}</div>
              <p className="detail-loc">{property.locality}</p>

              <div className="emi-snapshot">
                <span>EMI from</span>
                <b>{formatINR(emi)}/mo</b>
                <small>Est. 80% LTV · 8.5% · 20 yrs</small>
              </div>

              <a className="btn btn-whatsapp" href={waHref} target="_blank" rel="noopener noreferrer">
                WhatsApp owner
              </a>
              <SaveButton slug={property.slug} />

              <div className="detail-owner">
                <div className="avatar">{property.ownerName.charAt(0)}</div>
                <div>
                  <b>{property.ownerName}</b>
                  <span>Verified owner · Direct contact</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="related">
          <div className="section-head">
            <div>
              <h2>Similar homes</h2>
              <p>More verified listings near this price range.</p>
            </div>
            <Link className="link-more" href="/buy">View all →</Link>
          </div>
          <div className="prop-grid">
            {related.map((item) => (
              <PropertyCard
                key={item.slug}
                property={item}
                detailsHref={`/buy/${item.slug}`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
