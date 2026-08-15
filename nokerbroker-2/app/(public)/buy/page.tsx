import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { BuyFilters } from "@/components/buy-filters";
import { filterProperties, type PropertyFilters } from "@/lib/properties";
import { getLiveProperties } from "@/lib/properties-db";
import { PropertySearchResults } from "@/components/property-search-results";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const VALID_SORTS = ["recommended", "price-low", "price-high", "area"] as const;
type SortValue = (typeof VALID_SORTS)[number];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const locality = valueOf(params.locality);
  return {
    title: locality
      ? `${locality} — flats for sale`
      : "Buy — verified flats for sale",
    description:
      "Zero-brokerage verified flats and apartments in Mumbai. Filter by locality, budget and BHK, then message the owner directly on WhatsApp.",
  };
}

export default async function BuyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const locality = valueOf(params.locality) ?? "";
  const budget = valueOf(params.budget) ?? "Any budget";
  const bhk = valueOf(params.bhk) ?? "Any";
  const sortParam = valueOf(params.sort) ?? "";
  const sort: SortValue = (VALID_SORTS as readonly string[]).includes(sortParam)
    ? (sortParam as SortValue)
    : "recommended";

  const filters: PropertyFilters = { locality, budget, bhk, sort };
  const listings = await getLiveProperties();
  const filtered = filterProperties(listings, filters);
  const activeCount = [locality, budget !== "Any budget", bhk !== "Any"].filter(
    Boolean
  ).length;

  return (
    <main className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Zero brokerage · Direct owners</p>
            <h1 className="buy-title">Properties for sale</h1>
            <p>Search results update from your locality, budget and BHK filters.</p>
          </div>
          <span className="link-more">
            {filtered.length} listing{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        <BuyFilters locality={locality} budget={budget} bhk={bhk} sort={sort} />
        <Suspense fallback={<GridSkeleton />}>
          <div className="buy-meta">
            <span>
              {activeCount > 0
                ? `${filtered.length} of ${listings.length} listings match`
                : `${filtered.length} verified listings`}
            </span>
            {activeCount > 0 && (
              <Link className="buy-clear" href="/buy">Clear all filters</Link>
            )}
          </div>

          {filtered.length ? <PropertySearchResults properties={filtered} token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} /> : (
            <div className="empty-state">
              <h2>No matching listings</h2>
              <p>Try a broader locality, budget or BHK — new verified homes are added every day.</p>
              <Link className="btn btn-primary" href="/buy">Reset filters</Link>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  );
}

function GridSkeleton() {
  return (
    <div>
      <div className="buy-meta">
        <span>Loading listings…</span>
      </div>
      <div className="grid-skeleton" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skel-card" key={index}>
            <div className="skel-media" />
            <div className="skel-line" />
            <div className="skel-line short" />
          </div>
        ))}
      </div>
    </div>
  );
}
