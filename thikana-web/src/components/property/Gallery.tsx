"use client";

import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];

  if (!current) {
    return (
      <div className="relative h-[420px] rounded-[28px] bg-gradient-to-br from-orange-pale to-orange" />
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-[420px] overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-pale to-orange">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={`${alt} — photo ${index + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl2 border-2 transition ${
                i === index ? "border-orange" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
