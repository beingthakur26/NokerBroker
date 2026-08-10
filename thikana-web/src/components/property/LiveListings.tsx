"use client";

import { useEffect, useState } from "react";
import { PropertyCard } from "./PropertyCard";

interface LiveListing {
  id: string;
  type: "FLAT" | "VILLA" | "PLOT" | "COMMERCIAL";
  locality: string;
  pinCode: string;
  price: number;
  areaSqft: number;
  bhk: number;
  images: string[];
}

function formatPrice(price: number) {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (price >= 100_000) return `₹${(price / 100_000).toFixed(1).replace(/\.0$/, "")} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export function LiveListings() {
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    fetch("/api/listings")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Unable to load listings");
        if (active) setListings(data?.listings ?? []);
      })
      .then(() => active && setState("ready"))
      .catch(() => active && setState("error"));

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-16 bg-bg-warm">
      <div className="max-w-[1200px] mx-auto px-6">
        <span className="text-xs font-mono uppercase tracking-widest text-orange-deep block mb-2">
          Just listed
        </span>
        <h2 className="font-display text-2xl text-ink mb-7">Latest owner listings</h2>

        {state === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Loading listings">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[310px] rounded-xl2 bg-orange-pale/50 animate-pulse" />
            ))}
          </div>
        )}

        {state === "error" && (
          <p className="text-sm text-ink-soft">Listings are temporarily unavailable. Please try again shortly.</p>
        )}

        {state === "ready" && listings.length === 0 && (
          <p className="text-sm text-ink-soft">No properties have been listed yet. Be the first owner to post one.</p>
        )}

        {state === "ready" && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <PropertyCard
                key={listing.id}
                price={formatPrice(listing.price)}
                meta={`${listing.bhk} BHK · ${listing.areaSqft.toLocaleString("en-IN")} sq.ft · ${listing.type}`}
                locality={`${listing.locality} · ${listing.pinCode}`}
                imageUrl={listing.images[0]}
                noBrokerage
                href={`/property/${listing.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
