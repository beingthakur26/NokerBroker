"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../../lib/useSession";

interface Listing {
  _id: string;
  locality: string;
  price: number;
  bhk: number;
  images: string[];
  status: "PENDING" | "LIVE" | "REJECTED" | "PAUSED";
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-orange-pale text-orange-deep",
  LIVE: "bg-verified-bg text-verified",
  REJECTED: "bg-red-100 text-red-700",
  PAUSED: "bg-[#EFEAE6] text-ink-soft",
};

export default function SellerDashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user?.role !== "SELLER") {
      router.replace(user?.role === "BUILDER" ? "/dashboard/builder" : "/profile");
      return;
    }
    if (user) {
      fetch("/api/listings/mine", { credentials: "include" })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok) throw new Error(data?.error || "Unable to load listings");
          setListings(data?.listings || []);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Unable to load listings");
        });
    }
  }, [user, loading, router]);

  if (loading) return <p className="text-center mt-20 text-ink-soft">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="font-display text-2xl text-ink mb-6">Your listings</h2>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {listings.length === 0 && (
        <p className="text-sm text-ink-soft">You haven&apos;t listed a property yet.</p>
      )}
      <div className="space-y-3">
        {listings.map((l) => (
          <div key={l._id} className="bg-white border border-border rounded-xl2 overflow-hidden flex items-stretch">
            <div className="relative h-24 w-28 shrink-0 bg-gradient-to-br from-orange-pale to-orange">
              {l.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.images[0]}
                  alt={l.locality}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between gap-4 p-5">
              <div>
                <div className="font-mono font-semibold text-ink">₹{l.price.toLocaleString("en-IN")}</div>
                <div className="text-sm text-ink-soft">{l.bhk} BHK · {l.locality}</div>
              </div>
              <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full ${statusStyles[l.status]}`}>
                {l.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
