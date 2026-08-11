"use client";

import { useState } from "react";
import { PropertyImage } from "./property-image";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;
  const current = hasImages ? images[Math.min(active, images.length - 1)] : undefined;

  return (
    <div className="gallery">
      <div className="gallery-main">
        <PropertyImage
          imageUrl={current}
          alt={title}
          sizes="(max-width: 768px) 100vw, 52vw"
          priority
        />
      </div>
      {hasImages && images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, index) => (
            <button
              type="button"
              key={src}
              className={index === active ? "active" : undefined}
              onClick={() => setActive(index)}
              aria-label={`View photo ${index + 1}`}
            >
              <PropertyImage imageUrl={src} alt={`${title} photo ${index + 1}`} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
