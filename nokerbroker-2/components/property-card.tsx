"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatArea, formatPrice, type PropertyView } from "@/lib/properties";
import { PropertyImage } from "./property-image";
import { VerifiedStamp } from "./verified-stamp";

interface PropertyCardProps {
  property: PropertyView;
  detailsHref: string;
  whatsappHref?: string;
  imagePriority?: boolean;
}

export function PropertyCard({ property, detailsHref, whatsappHref, imagePriority = false }: PropertyCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const images = property.images.filter(Boolean);
  const hasMultipleImages = images.length > 1;
  const currentImage = images[activeImage] ?? images[0];
  const waHref = whatsappHref ?? `https://wa.me/${property.ownerWhatsapp}?text=${encodeURIComponent(
    `Hi ${property.ownerName}, I'm interested in the ${property.title} at ${property.locality} listed on NokerBroker (${property.priceValue}).`
  )}`;

  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = window.setInterval(() => setActiveImage((current) => (current + 1) % images.length), 4500);
    return () => window.clearInterval(interval);
  }, [hasMultipleImages, images.length]);

  function showImage(direction: -1 | 1) {
    setActiveImage((current) => (current + direction + images.length) % images.length);
  }

  return (
    <article className="prop-card">
      <div className="prop-media">
        <Link className="prop-media-link" href={detailsHref} aria-label={`${property.title} in ${property.locality}`}>
          <div className="prop-media-frame" key={currentImage}>
            <PropertyImage imageUrl={currentImage} alt={`${property.title} in ${property.locality}`} priority={imagePriority && activeImage === 0} />
          </div>
        </Link>
        {property.verified && <VerifiedStamp size="sm">Verified</VerifiedStamp>}
        {hasMultipleImages && <>
          <div className="prop-image-count" aria-live="polite">{activeImage + 1} / {images.length}</div>
          <div className="prop-image-controls" aria-label="Property photos">
            <button type="button" onClick={() => showImage(-1)} aria-label="Previous property photo"><ChevronLeft size={16} /></button>
            <button type="button" onClick={() => showImage(1)} aria-label="Next property photo"><ChevronRight size={16} /></button>
          </div>
        </>}
      </div>
      <div className="prop-body">
        <div className="prop-price">{formatPrice(property.priceValue)}</div>
        <div className="prop-title">{property.title}</div>
        <div className="prop-loc">{property.locality}</div>
        <div className="prop-meta">
          <span><b>{formatArea(property.areaSqft)}</b></span>
          <span><b>{property.bhk > 0 ? `${property.bhk} BHK` : property.type}</b></span>
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
