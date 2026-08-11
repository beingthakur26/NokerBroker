import Link from "next/link";
import { VerifiedStamp } from "./verified-stamp";

interface PropertyCardProps {
  price: string;
  title: string;
  locality: string;
  areaSqft: number | string;
  floor: string | number;
  furnishing: string;
  verified?: boolean;
  whatsappHref?: string;
  detailsHref?: string;
}

export function PropertyCard({
  price,
  title,
  locality,
  areaSqft,
  floor,
  furnishing,
  verified = true,
  whatsappHref = "#",
  detailsHref = "#",
}: PropertyCardProps) {
  return (
    <article className="prop-card">
      <div className="prop-media facade">
        <div className="roofline" />
        <div className="windows">
          {Array.from({ length: 15 }, (_, index) => <i key={index} className={index % 3 === 0 ? "lit" : ""} />)}
        </div>
        {verified && <VerifiedStamp size="sm">Verified</VerifiedStamp>}
      </div>
      <div className="prop-body">
        <div className="prop-price">{price}</div>
        <div className="prop-title">{title}</div>
        <div className="prop-loc">{locality}</div>
        <div className="prop-meta">
          <span><b>{areaSqft}</b> sqft</span>
          <span><b>{floor}</b> floor</span>
          <span><b>{furnishing}</b></span>
        </div>
        <div className="prop-actions">
          <Link className="btn btn-ghost" href={detailsHref}>Details</Link>
          <Link className="btn btn-whatsapp" href={whatsappHref}>WhatsApp owner</Link>
        </div>
      </div>
    </article>
  );
}
