import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  formatArea,
  formatINR,
  formatPrice,
  getRelatedProperties,
} from "@/lib/properties";
import { getLiveProperties, getPropertyBySlug } from "@/lib/properties-db";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyCard } from "@/components/property-card";
import { SaveButton } from "@/components/save-button";
import { EnquiryDialog } from "@/components/enquiry-dialog";
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
  const property = await getPropertyBySlug(propertySlug);
  if (!property) return { title: "Property not found" };
  return {
    title: `${property.title} in ${property.locality}`,
    description: property.description || `${property.bhk} BHK in ${property.locality}, listed by the owner.`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = await getPropertyBySlug(propertySlug);
  if (!property) notFound();

  const listings = await getLiveProperties();
  const related = getRelatedProperties(property, listings);
  const emi = estimateEmi(property.priceValue);
  const waText = `Hi ${property.ownerName}, I'm interested in the ${property.title} at ${property.locality} listed on NokerBroker (${formatPrice(property.priceValue)}). Could we talk?`;

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
              <p className="detail-desc">
                {property.description || `${property.title} in ${property.locality}, listed directly by the owner.`}
              </p>
              <div className="detail-facts">
                <div><span>Area</span><b>{formatArea(property.areaSqft)}</b></div>
                <div><span>Configuration</span><b>{property.bhk > 0 ? `${property.bhk} BHK` : property.type}</b></div>
                <div><span>Floor</span><b>{property.floor || "—"}</b></div>
                <div><span>Furnishing</span><b>{property.furnishing}</b></div>
                {property.zone && (
                  <div><span>Zone</span><b>{property.zone}</b></div>
                )}
                <div><span>PIN code</span><b>{property.pinCode}</b></div>
              </div>
              {property.amenities.length > 0 && (
                <div className="amenity-row">
                  {property.amenities.map((amenity) => (
                    <span className="badge" key={amenity}>{amenity}</span>
                  ))}
                </div>
              )}
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

              <EnquiryDialog
                slug={property.slug}
                nextPath={`/buy/${property.slug}`}
                listingLabel={`${property.title} at ${property.locality}`}
                ownerName={property.ownerName}
                ownerWhatsapp={property.ownerWhatsapp}
                waText={waText}
              />
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
