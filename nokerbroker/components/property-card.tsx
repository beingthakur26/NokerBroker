import Link from "next/link";
import { formatArea, formatPrice, type Property } from "@/lib/properties";
import { PropertyImage } from "./property-image";
import { VerifiedStamp } from "./verified-stamp";

interface PropertyCardProps {
  property: Property;
  detailsHref: string;
  whatsappHref?: string;
  imagePriority?: boolean;
}

export function PropertyCard({
  property,
  detailsHref,
  whatsappHref,
  imagePriority = false,
}: PropertyCardProps) {
  const waHref =
    whatsappHref ??
    `https://wa.me/${property.ownerWhatsapp}?text=${encodeURIComponent(
      `Hi ${property.ownerName}, I'm interested in the ${property.title} at ${property.locality} listed on NokerBroker (${property.priceValue}).`
    )}`;

  return (
    <article className="prop-card">
      <Link className="prop-media" href={detailsHref} aria-label={`${property.title} in ${property.locality}`}>
        <PropertyImage
          imageUrl={property.images[0]}
          alt={`${property.title} in ${property.locality}`}
          priority={imagePriority}
        />
        {property.verified && (
          <VerifiedStamp size="sm">Verified</VerifiedStamp>
        )}
      </Link>
      <div className="prop-body">
        <div className="prop-price">{formatPrice(property.priceValue)}</div>
        <div className="prop-title">{property.title}</div>
        <div className="prop-loc">{property.locality}</div>
        <div className="prop-meta">
          <span><b>{formatArea(property.areaSqft)}</b></span>
          <span><b>{property.bhk}</b> BHK</span>
          <span><b>{property.furnishing}</b></span>
        </div>
        <div className="prop-actions">
          <Link className="btn btn-ghost" href={detailsHref}>Details</Link>
          <a className="btn btn-whatsapp" href={waHref} target="_blank" rel="noopener noreferrer">WhatsApp owner</a>
        </div>
      </div>
    </article>
  );
}
