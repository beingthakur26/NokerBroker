"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyImage } from "./property-image";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;
  const current = hasImages ? images[Math.min(active, images.length - 1)] : undefined;
  const hasMultipleImages = images.length > 1;

  function showImage(direction: -1 | 1) {
    setActive((currentIndex) => (currentIndex + direction + images.length) % images.length);
  }

  return (
    <div className="gallery">
      <div className="gallery-main">
        <div className="gallery-image-frame" key={current}>
          <PropertyImage imageUrl={current} alt={title} sizes="(max-width: 768px) 100vw, 52vw" priority />
        </div>
        {hasMultipleImages && (
          <div className="gallery-controls" aria-label="Property photos">
            <button type="button" onClick={() => showImage(-1)} aria-label="Previous property photo"><ChevronLeft size={20} /></button>
            <span>{active + 1} / {images.length}</span>
            <button type="button" onClick={() => showImage(1)} aria-label="Next property photo"><ChevronRight size={20} /></button>
          </div>
        )}
      </div>
      {hasMultipleImages && (
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
