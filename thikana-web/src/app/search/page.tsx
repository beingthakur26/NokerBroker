"use client";

import { useCallback, useEffect, useState } from "react";
import { PropertyCard } from "../../components/property/PropertyCard";
import { Chip } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";
import { formatPrice } from "../../lib/formatPrice";

type PropertyType = "FLAT" | "VILLA" | "PLOT" | "COMMERCIAL";

interface Listing {
  id: string;
  type: PropertyType;
  locality: string;
  pinCode: string;
  price: number;
  areaSqft: number;
  bhk: number;
  images: string[];
}

const typeLabels: Record<PropertyType, string> = {
  FLAT: "Flat",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

const typeOptions: PropertyType[] = ["FLAT", "VILLA", "PLOT", "COMMERCIAL"];

interface SearchFilters {
  locality: string;
  type: PropertyType | "";
  bhk: string;
  minPrice: string;
  maxPrice: string;
}

export default function SearchPage() {
  const [type, setType] = useState<PropertyType | "">("");
  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const loadListings = useCallback(async (filters: SearchFilters): Promise<Listing[]> => {
    const params = new URLSearchParams();
    if (filters.locality.trim()) params.set("locality", filters.locality.trim());
    if (filters.type) params.set("type", filters.type);
    if (filters.bhk) params.set("bhk", filters.bhk);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    const qs = params.toString();
    const res = await fetch(`/api/listings${qs ? `?${qs}` : ""}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Unable to load listings");
    return data?.listings ?? [];
  }, []);

  function searchNow() {
    setState("loading");
    setError("");
    loadListings({ locality, type, bhk, minPrice, maxPrice })
      .then((items) => {
        setListings(items);
        setState("ready");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load listings");
        setState("error");
      });
  }

  useEffect(() => {
    let active = true;
    loadListings({ locality: "", type: "", bhk: "", minPrice: "", maxPrice: "" })
      .then((items) => {
        if (active) {
          setListings(items);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load listings");
          setState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [loadListings]);

  function resetFilters() {
    setType("");
    setLocality("");
    setBhk("");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Buy</span>
      <h1 className="font-display text-3xl text-ink mt-2">Search properties in Mumbai</h1>

      <div className="mt-7 bg-white border border-border rounded-xl2 p-5 shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Locality</label>
            <input
              value={locality}
              onChange={(event) => setLocality(event.target.value)}
              placeholder="Andheri West, Thane…"
              className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">BHK</label>
            <select
              value={bhk}
              onChange={(event) => setBhk(event.target.value)}
              className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
            >
              <option value="">Any</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Min price (₹)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="5000000"
              className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Max price (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="20000000"
              className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {typeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setType(type === option ? "" : option)}
              aria-pressed={type === option}
            >
              <Chip active={type === option}>{typeLabels[option]}</Chip>
            </button>
          ))}
          <span className="ml-auto flex gap-2.5">
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
            <Button variant="accent" onClick={searchNow}>Search</Button>
          </span>
        </div>
      </div>

      <div className="mt-9 flex items-end justify-between">
        <h2 className="font-display text-xl text-ink">Results</h2>
        {state === "ready" && (
          <span className="text-xs font-mono text-ink-soft">{listings.length} listing{listings.length === 1 ? "" : "s"}</span>
        )}
      </div>

      {state === "loading" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Loading listings">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[310px] rounded-xl2 bg-orange-pale/50 animate-pulse" />
          ))}
        </div>
      )}

      {state === "error" && (
        <p className="mt-6 text-sm text-ink-soft">{error}</p>
      )}

      {state === "ready" && listings.length === 0 && (
        <p className="mt-6 text-sm text-ink-soft">
          No properties match your filters. Try widening the search.
        </p>
      )}

      {state === "ready" && listings.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <PropertyCard
              key={listing.id}
              price={formatPrice(listing.price)}
              meta={`${listing.bhk} BHK · ${listing.areaSqft.toLocaleString("en-IN")} sq.ft · ${typeLabels[listing.type]}`}
              locality={`${listing.locality} · ${listing.pinCode}`}
              imageUrl={listing.images[0]}
              noBrokerage
              href={`/property/${listing.id}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
