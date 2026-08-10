"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PropertyCard } from "../../components/property/PropertyCard";
import { Chip } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";
import { MobileFilterSheet } from "../../components/layout/MobileFilterSheet";
import { useSession } from "../../lib/useSession";
import { apiPost } from "../../lib/api-client";
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

interface SearchResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
}

const typeLabels: Record<PropertyType, string> = {
  FLAT: "Flat",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

const typeOptions: PropertyType[] = ["FLAT", "VILLA", "PLOT", "COMMERCIAL"];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { user } = useSession();
  const [type, setType] = useState<PropertyType | "">((searchParams.get("type") as PropertyType | "") || "");
  const [locality, setLocality] = useState(searchParams.get("locality") ?? "");
  const [bhk, setBhk] = useState(searchParams.get("bhk") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const loadListings = useCallback(async (filters: {
    locality: string;
    type: PropertyType | "";
    bhk: string;
    minPrice: string;
    maxPrice: string;
    sort: "newest" | "price_asc" | "price_desc";
    page: number;
  }): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    if (filters.locality.trim()) params.set("locality", filters.locality.trim());
    if (filters.type) params.set("type", filters.type);
    if (filters.bhk === "4+") params.set("minBhk", "4");
    else if (filters.bhk) params.set("bhk", filters.bhk);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (filters.page > 1) params.set("page", String(filters.page));
    const qs = params.toString();
    const res = await fetch(`/api/listings${qs ? `?${qs}` : ""}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Unable to load listings");
    return data ?? { listings: [], total: 0, page: 1, limit: 24 };
  }, []);

  function searchNow(nextPage = 1) {
    setState("loading");
    setError("");
    loadListings({ locality, type, bhk, minPrice, maxPrice, sort, page: nextPage })
      .then((data) => {
        setListings(data.listings);
        setTotal(data.total);
        setPage(nextPage);
        setState("ready");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load listings");
        setState("error");
      });
  }

  useEffect(() => {
    let active = true;
    loadListings({ locality, type, bhk, minPrice, maxPrice, sort, page: 1 })
      .then((data) => {
        if (active) {
          setListings(data.listings);
          setTotal(data.total);
          setPage(1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadListings]);

  function resetFilters() {
    setType("");
    setLocality("");
    setBhk("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  }

  function hasActiveFilters() {
    return Boolean(locality.trim() || type || bhk || minPrice || maxPrice);
  }

  async function saveSearch() {
    if (!user) return;
    setSaveMessage("");
    try {
      const filters: Record<string, string> = {};
      if (locality.trim()) filters.locality = locality.trim();
      if (type) filters.type = type;
      if (bhk) filters.bhk = bhk;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;
      await apiPost("/me/saved-searches", { name: saveName.trim() || `${locality.trim() || "All"} search`, filters });
      setSaveOpen(false);
      setSaveName("");
      setSaveMessage("Search saved to your dashboard.");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Unable to save search");
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / 24));

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
              onKeyDown={(e) => e.key === "Enter" && searchNow(1)}
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
              <option value="4+">4+ BHK</option>
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
          <span className="ml-auto flex flex-wrap items-center gap-2.5">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort results"
              className="border-[1.5px] border-border rounded-full px-3.5 py-2 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
            {hasActiveFilters() && (
              user ? (
                saveOpen ? (
                  <span className="flex items-center gap-2">
                    <input
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Name this search"
                      className="w-44 border-[1.5px] border-border rounded-full px-3.5 py-2 text-sm"
                    />
                    <Button variant="outline" onClick={saveSearch}>Save</Button>
                    <Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
                  </span>
                ) : (
                  <Button variant="outline" onClick={() => setSaveOpen(true)}>Save search</Button>
                )
              ) : (
                <Link href="/login" className="text-sm font-semibold text-orange-deep self-center">Save this search</Link>
              )
            )}
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
            <Button variant="accent" onClick={() => searchNow(1)}>Search</Button>
          </span>
        </div>
        {saveMessage && <p className="mt-3 text-sm text-ink-soft">{saveMessage}</p>}
      </div>

      <div className="mt-9 flex items-end justify-between">
        <h2 className="font-display text-xl text-ink">Results</h2>
        <span className="flex items-center gap-3">
          {state === "ready" && (
            <span className="text-xs font-mono text-ink-soft">{total} listing{total === 1 ? "" : "s"}</span>
          )}
          <Button variant="outline" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
            Filters
          </Button>
        </span>
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
        <>
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
          {pageCount > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2.5">
              <Button variant="outline" disabled={page <= 1} onClick={() => searchNow(page - 1)}>
                ← Previous
              </Button>
              <span className="text-xs font-mono text-ink-soft">
                Page {page} of {pageCount}
              </span>
              <Button variant="outline" disabled={page >= pageCount} onClick={() => searchNow(page + 1)}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        onApply={() => {
          setMobileFiltersOpen(false);
          searchNow(1);
        }}
        onReset={resetFilters}
        type={type}
        setType={setType}
        bhk={bhk}
        setBhk={setBhk}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-center mt-20 text-ink-soft">Loading...</p>}>
      <SearchPageContent />
    </Suspense>
  );
}
