"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Gallery } from "../../../components/property/Gallery";
import { Button } from "../../../components/ui/Button";
import { VerifiedStamp } from "../../../components/ui/VerifiedStamp";
import { useContactReveal } from "../../../lib/useContactReveal";
import { useSession } from "../../../lib/useSession";
import { apiPost } from "../../../lib/api-client";
import { formatPrice } from "../../../lib/formatPrice";

interface ListingDetail {
  id: string;
  type: "FLAT" | "VILLA" | "PLOT" | "COMMERCIAL";
  locality: string;
  pinCode: string;
  price: number;
  areaSqft: number;
  bhk: number;
  description?: string;
  amenities?: string[];
  images: string[];
  createdAt?: string;
  owner?: { name?: string; phone?: string } | null;
}

const typeLabels: Record<ListingDetail["type"], string> = {
  FLAT: "Flat / Apartment",
  VILLA: "Villa / House",
  PLOT: "Plot / Land",
  COMMERCIAL: "Commercial",
};

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: sessionLoading } = useSession();
  const { handleContactReveal } = useContactReveal();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/listings/${params.id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Unable to load the property");
        if (active) setListing(data?.listing ?? null);
      })
      .then(() => active && setState("ready"))
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [params.id]);

  useEffect(() => {
    if (!sessionLoading && user) {
      fetch("/api/me/favorites", { credentials: "include" })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok) return;
          const matches = (data?.favorites ?? []).filter(
            (f: { targetType: string; targetId: string }) =>
              f.targetType === "LISTING" && f.targetId === params.id
          );
          setSaved(matches.length > 0);
        })
        .catch(() => undefined);
    }
  }, [sessionLoading, user, params.id]);

  async function toggleFavorite() {
    if (!listing || saving) return;
    setSaving(true);
    try {
      if (saved) return;
      await apiPost("/me/favorites", { targetType: "LISTING", targetId: listing.id });
      setSaved(true);
    } catch {
      // keep current state on failure
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") {
    return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  }

  if (state === "error" || !listing) {
    return (
      <main className="max-w-2xl mx-auto py-20 px-6 text-center">
        <h1 className="font-display text-2xl text-ink">Property not found</h1>
        <p className="text-sm text-ink-soft mt-2">It may have been removed or is not live.</p>
        <Link href="/search" className="mt-6 inline-block text-sm font-semibold text-orange-deep">← Back to search</Link>
      </main>
    );
  }

  const contact = handleContactReveal(listing);

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <Link href="/search" className="text-sm font-semibold text-ink-soft hover:text-orange-deep">← Back to search</Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-9">
        <Gallery images={listing.images} alt={listing.locality} />

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-ink text-white">NO BROKERAGE</span>
                <VerifiedStamp size="sm" />
              </div>
              <div className="font-mono text-3xl font-semibold text-ink mt-4">{formatPrice(listing.price)}</div>
              <div className="text-sm text-ink-soft mt-1.5">
                {listing.bhk} BHK · {listing.areaSqft.toLocaleString("en-IN")} sq.ft · {typeLabels[listing.type]}
              </div>
              <div className="text-xs text-ink-faint mt-0.5">
                {listing.locality} · Pin {listing.pinCode}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-bg-warm border border-border rounded-xl2 p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-deep mb-3">Contact owner</p>
            {contact.phone ? (
              <p className="text-sm text-ink mb-4">
                {listing.owner?.name ? `${listing.owner.name} · ` : ""}
                <span className="font-mono font-semibold">{contact.phone}</span>
              </p>
            ) : (
              <p className="text-sm text-ink-soft mb-4">Owner contact unavailable for this listing.</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              {contact.telHref ? (
                <a href={contact.telHref} className="flex-1">
                  <Button variant="outline" block>Call</Button>
                </a>
              ) : (
                <Button variant="outline" block disabled>Call</Button>
              )}
              {contact.whatsappHref ? (
                <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="whatsapp" block>WhatsApp</Button>
                </a>
              ) : (
                <Button variant="whatsapp" block disabled>WhatsApp</Button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/loans/apply" className="flex-1">
              <Button variant="primary" block>Apply for loan</Button>
            </Link>
            {!sessionLoading && user ? (
              <Button variant="outline" block onClick={toggleFavorite} disabled={saving}>
                {saved ? "Saved ✓" : "Save to favorites"}
              </Button>
            ) : (
              <Link href="/login" className="flex-1">
                <Button variant="outline" block>Save to favorites</Button>
              </Link>
            )}
          </div>
          <Link
            href={`/compare?ids=${listing.id}`}
            className="mt-3 inline-flex items-center justify-center gap-2 text-xs font-semibold text-ink-soft hover:text-orange-deep transition"
          >
            ⇄ Compare this property
          </Link>

          <p className="text-xs text-ink-faint mt-5 leading-relaxed">
            This is an owner or RERA-verified listing on NokerBroker. No brokerage, no middlemen —
            you deal directly with the person who holds the keys.
          </p>
        </div>
      </div>

      {(listing.description || (listing.amenities?.length ?? 0) > 0) && (
        <section className="mt-12 max-w-[760px]">
          {listing.description && (
            <>
              <h2 className="font-display text-2xl text-ink">About this property</h2>
              <p className="text-sm text-ink-soft mt-3 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </>
          )}
          {(listing.amenities?.length ?? 0) > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-orange-deep mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities!.map((amenity) => (
                  <span key={amenity} className="text-xs px-3.5 py-1.5 rounded-full border-[1.5px] border-border text-ink-soft">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
