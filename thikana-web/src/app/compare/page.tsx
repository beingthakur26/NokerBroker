"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ComparisonTable, ComparableListing } from "../../components/property/ComparisonTable";
import { Button } from "../../components/ui/Button";
import { useSession } from "../../lib/useSession";

const MAX = 4;

function ComparePageContent() {
  const searchParams = useSearchParams();
  const { user, loading: sessionLoading } = useSession();
  const [listings, setListings] = useState<ComparableListing[]>([]);
  const [state, setState] = useState<"loading" | "ready">("loading");
  const [favorites, setFavorites] = useState<{ id: string; targetId: string; listing: ComparableListing | null }[]>([]);

  const requestedIds = useMemo(() => {
    const raw = searchParams.get("ids") ?? "";
    return raw.split(",").map((id) => id.trim()).filter(Boolean).slice(0, MAX);
  }, [searchParams]);

  const [ids, setIds] = useState<string[]>(requestedIds);
  const [prevRequested, setPrevRequested] = useState<string[]>(requestedIds);
  if (requestedIds.join("|") !== prevRequested.join("|")) {
    setPrevRequested(requestedIds);
    setIds(requestedIds);
  }

  const load = useCallback(async (targetIds: string[]) => {
    const results = await Promise.all(
      targetIds.map(async (id) => {
        try {
          const res = await fetch(`/api/listings/${id}`);
          const data = await res.json().catch(() => null);
          if (!res.ok) return null;
          return data?.listing ?? null;
        } catch {
          return null;
        }
      })
    );
    return results.filter((result): result is ComparableListing => Boolean(result)).slice(0, MAX);
  }, []);

  useEffect(() => {
    if (ids.length === 0) return;
    let active = true;
    load(ids)
      .then((results) => {
        if (active) {
          setListings(results);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("ready");
      });
    return () => {
      active = false;
    };
  }, [ids, load]);

  useEffect(() => {
    if (!sessionLoading && user) {
      fetch("/api/me/favorites", { credentials: "include" })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok) return;
          setFavorites(
            (data?.favorites ?? []).filter(
              (f: { targetType: string; listing: ComparableListing | null }) =>
                f.targetType === "LISTING" && f.listing && f.listing.status === "LIVE"
            )
          );
        })
        .catch(() => undefined);
    }
  }, [sessionLoading, user]);

  function addListing(id: string) {
    if (ids.length >= MAX) return;
    setState("loading");
    setIds(ids.includes(id) ? ids : [...ids, id]);
  }

  function removeListing(id: string) {
    setState("loading");
    setIds(ids.filter((item) => item !== id));
  }

  const slotCount = MAX - ids.length;
  const availableFavorites = favorites.filter(
    (f) => !ids.includes(f.targetId)
  );

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Compare</span>
      <h1 className="font-display text-3xl text-ink mt-2">Compare properties side by side</h1>
      <p className="text-sm text-ink-soft mt-2 max-w-[560px]">
        Line up up to 4 properties to weigh price, size, and amenities before you decide.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        {[1, 2, 3, 4].map((slot) => (
          <span
            key={slot}
            className={`w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center font-mono text-sm transition ${
              slot <= ids.length ? "bg-ink text-white border-ink" : "border-border text-ink-faint"
            }`}
          >
            {slot}
          </span>
        ))}
        <Link href="/search" className="text-sm font-semibold text-orange-deep ml-2">
          + Add from search
        </Link>
      </div>

      {state === "loading" && ids.length > 0 && (
        <div className="mt-9 h-[420px] rounded-xl2 bg-orange-pale/50 animate-pulse" aria-label="Loading comparison" />
      )}

      {ids.length === 0 && (
        <div className="mt-9 bg-white border border-border rounded-xl2 p-10 text-center max-w-[560px]">
          <h2 className="font-display text-xl text-ink">Nothing to compare yet</h2>
          <p className="text-sm text-ink-soft mt-2">
            Pick properties from search or from your saved favorites to start comparing.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/search">
              <Button variant="accent">Browse properties</Button>
            </Link>
            {!sessionLoading && user && (
              <Link href="/dashboard/buyer">
                <Button variant="outline">My favorites</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {state === "ready" && ids.length > 0 && listings.length === 0 && (
        <p className="mt-9 text-sm text-ink-soft">Those properties could not be loaded. They may no longer be live.</p>
      )}

      {state === "ready" && listings.length > 0 && (
        <div className="mt-9 space-y-8">
          <ComparisonTable listings={listings} onRemove={removeListing} />

          {slotCount > 0 && (
            <div className="bg-white border border-border rounded-xl2 p-5 max-w-[560px]">
              {!sessionLoading && user ? (
                availableFavorites.length > 0 ? (
                  <>
                    <p className="text-xs font-mono uppercase tracking-widest text-orange-deep mb-3">
                      Add from favorites
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableFavorites.slice(0, slotCount).map((favorite) => (
                        <button key={favorite.id} onClick={() => addListing(favorite.targetId)}>
                          <span className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border-[1.5px] border-border text-ink-soft hover:border-orange hover:text-orange-deep transition">
                            {favorite.listing!.bhk} BHK · {favorite.listing!.locality}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink-soft">
                    No favorited properties to add.{" "}
                    <Link href="/search" className="font-semibold text-orange-deep">Browse properties</Link>.
                  </p>
                )
              ) : (
                <p className="text-sm text-ink-soft">
                  <Link href="/login" className="font-semibold text-orange-deep">Log in</Link> to add properties from your saved favorites.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<p className="text-center mt-20 text-ink-soft">Loading...</p>}>
      <ComparePageContent />
    </Suspense>
  );
}
