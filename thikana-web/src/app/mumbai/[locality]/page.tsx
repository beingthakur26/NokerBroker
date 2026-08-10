import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "../../../components/property/PropertyCard";
import { Button } from "../../../components/ui/Button";
import { formatPrice } from "../../../lib/formatPrice";

export const dynamic = "force-dynamic";

interface LocalityInfo {
  name: string;
  blurb: string;
}

const LOCALITIES: Record<string, LocalityInfo> = {
  "andheri-west": {
    name: "Andheri West",
    blurb:
      "From the DN Nagar station hub to the quiet lanes of Four Bungalows, Andheri West offers some of Mumbai's most liquid residential stock — metro-connected, office-district adjacent, and full of options.",
  },
  "bandra-west": {
    name: "Bandra West",
    blurb:
      "The seaside suburb with Carter Road, Bandstand, and a mix of sea-view flats and heritage buildings. Premium pricing, premium living.",
  },
  "borivali-west": {
    name: "Borivali West",
    blurb:
      "National Park on one side, the Western Express Highway on the other. Borivali West is where growing families look for space without leaving the city.",
  },
  "vashi": {
    name: "Vashi, Navi Mumbai",
    blurb:
      "Navi Mumbai's original satellite township — planned roads, ample parking, and some of the best value-per-square-foot on the network.",
  },
  "thane-west": {
    name: "Thane West",
    blurb:
      "The fastest-growing residential micro-market around Mumbai, with lake views, new high-rises, and constant new supply from RERA-verified builders.",
  },
  "powai": {
    name: "Powai",
    blurb:
      "IT parks, the Powai lake, and a lively food scene. Powai's flats are sought after by young professionals and families alike.",
  },
  "kharghar": {
    name: "Kharghar, Navi Mumbai",
    blurb:
      "A planned hilltown with the Central Park, international schools, and quiet, green layouts — a favourite for first-time buyers.",
  },
  "malad-west": {
    name: "Malad West",
    blurb:
      "Kandivali to the north, Goregaon to the south, and the Goregaon-Malad Link Road running through. Solid connectivity and a wide price band.",
  },
};

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInfo(slug: string) {
  const known = LOCALITIES[slug];
  return known ?? { name: slugToName(slug), blurb: "" };
}

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

async function getLocalitiesListings(name: string): Promise<LiveListing[]> {
  const base = process.env.API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(
      `${base}/listings?locality=${encodeURIComponent(name)}&limit=24`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    return Array.isArray(data?.listings) ? data.listings : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locality: string }>;
}): Promise<Metadata> {
  const { locality } = await params;
  const info = getInfo(locality);
  return {
    title: `${info.name} Properties in Mumbai — Flats, Villas & Plots`,
    description:
      info.blurb ||
      `Browse owner-verified and RERA-verified properties in ${info.name}, Mumbai. No brokerage, no middlemen — ever.`,
    alternates: { canonical: `/mumbai/${locality}` },
    openGraph: {
      title: `${info.name} Properties in Mumbai · NokerBroker`,
      description:
        info.blurb ||
        `Owner-verified properties in ${info.name}, Mumbai. No brokerage, ever.`,
      type: "website",
    },
  };
}

export default async function LocalityPage({
  params,
}: {
  params: Promise<{ locality: string }>;
}) {
  const { locality } = await params;
  const info = getInfo(locality);
  const listings = await getLocalitiesListings(info.name);

  if (listings.length === 0) notFound();

  const minPrice = listings.reduce((min, l) => Math.min(min, l.price), Number.POSITIVE_INFINITY);
  const maxPrice = listings.reduce((max, l) => Math.max(max, l.price), 0);

  const otherLocalities = Object.entries(LOCALITIES).filter(([slug]) => slug !== locality);

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <nav aria-label="Breadcrumb" className="text-xs text-ink-faint">
        <Link href="/" className="hover:text-orange-deep">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">Mumbai</span>
        <span className="mx-2">/</span>
        <span className="text-ink">{info.name}</span>
      </nav>

      <section className="mt-6 max-w-[760px]">
        <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">
          Buy in {info.name}
        </span>
        <h1 className="font-display text-4xl text-ink mt-2">
          Flats, villas & plots in {info.name}, Mumbai
        </h1>
        {info.blurb && <p className="text-sm text-ink-soft mt-4 leading-relaxed">{info.blurb}</p>}
        <div className="mt-5 flex flex-wrap gap-8">
          <div>
            <span className="block text-[10.5px] font-mono uppercase tracking-widest text-ink-soft">Listings</span>
            <span className="font-mono text-xl font-semibold text-ink">{listings.length}</span>
          </div>
          {Number.isFinite(minPrice) && (
            <div>
              <span className="block text-[10.5px] font-mono uppercase tracking-widest text-ink-soft">Starting at</span>
              <span className="font-mono text-xl font-semibold text-ink">{formatPrice(minPrice)}</span>
            </div>
          )}
          {Number.isFinite(maxPrice) && (
            <div>
              <span className="block text-[10.5px] font-mono uppercase tracking-widest text-ink-soft">Up to</span>
              <span className="font-mono text-xl font-semibold text-ink">{formatPrice(maxPrice)}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
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
        <div className="mt-8 text-center">
          <Link href={`/search?locality=${encodeURIComponent(info.name)}`}>
            <Button variant="outline">View all {info.name} results</Button>
          </Link>
        </div>
      </section>

      <section className="mt-16 bg-bg-warm border border-border rounded-xl2 p-8">
        <h2 className="font-display text-xl text-ink">Why buy in {info.name} without a broker?</h2>
        <p className="text-sm text-ink-soft mt-3 max-w-[680px] leading-relaxed">
          Every property on NokerBroker is posted by the owner or an approved RERA-verified builder and
          reviewed by our team before it goes live. You talk to the person who actually holds the keys —
          and you pay zero brokerage.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link href="/post-property">
            <Button variant="accent">List your property free</Button>
          </Link>
          <Link href="/compare">
            <Button variant="outline">Compare properties</Button>
          </Link>
        </div>
      </section>

      {otherLocalities.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-lg text-ink mb-4">Explore other localities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {otherLocalities.map(([slug, localityInfo]) => (
              <Link
                key={slug}
                href={`/mumbai/${slug}`}
                className="bg-white border border-border rounded-xl2 px-4 py-3.5 text-sm font-semibold text-ink hover:border-orange hover:text-orange-deep transition"
              >
                {localityInfo.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
