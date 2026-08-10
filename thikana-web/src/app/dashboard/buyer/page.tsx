"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../../lib/useSession";
import { formatPrice } from "../../../lib/formatPrice";

type Tab = "overview" | "favorites" | "searches" | "inquiries" | "loans";

interface Favorite {
  id: string;
  targetType: "LISTING" | "PROJECT";
  targetId: string;
  listing?: { id: string; locality: string; price: number; bhk: number; images: string[] } | null;
  project?: { id: string; name: string; locality: string; images: string[] } | null;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    locality?: string;
    type?: string;
    bhk?: number;
    minPrice?: number;
    maxPrice?: number;
  };
}

interface Loan {
  id: string;
  propertyPrice: number;
  loanAmount: number;
  tenureYears: number;
  interestRate: number;
  monthlyIncome: number;
  employmentType: string;
  status: "APPLIED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface Inquiry {
  id: string;
  projectName: string;
  name: string;
  phone: string;
  message: string;
  unitType: string;
  createdAt: string;
}

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Unable to load");
  return data as T;
}

const loanStatusStyles: Record<string, string> = {
  APPLIED: "bg-orange-pale text-orange-deep",
  UNDER_REVIEW: "bg-[#E8E4FF] text-[#5B4BC4]",
  APPROVED: "bg-verified-bg text-verified",
  REJECTED: "bg-red-100 text-red-700",
};

function searchHref(filters: SavedSearch["filters"]) {
  const params = new URLSearchParams();
  if (filters.locality) params.set("locality", filters.locality);
  if (filters.type) params.set("type", filters.type);
  if (filters.bhk) params.set("bhk", String(filters.bhk));
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  return `/search?${params.toString()}`;
}

export default function BuyerDashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user && user.role !== "BUYER") {
      router.replace("/profile");
      return;
    }
    if (!loading && user?.role === "BUYER") {
      void Promise.all([
        api<{ favorites: Favorite[] }>("/me/favorites"),
        api<{ savedSearches: SavedSearch[] }>("/me/saved-searches"),
        api<{ loans: Loan[] }>("/me/loans/mine"),
        api<{ inquiries: Inquiry[] }>("/me/inquiries"),
      ])
        .then(([f, s, l, i]) => {
          setFavorites(f.favorites);
          setSearches(s.savedSearches);
          setLoans(l.loans);
          setInquiries(i.inquiries);
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load your dashboard"));
    }
  }, [user, loading, router]);

  if (loading || !user) return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  if (user.role !== "BUYER") return <p className="text-center mt-20 text-ink-soft">Redirecting...</p>;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "overview", label: "Overview", count: 0 },
    { key: "favorites", label: "Favorites", count: favorites.length },
    { key: "searches", label: "Saved searches", count: searches.length },
    { key: "inquiries", label: "Inquiries", count: inquiries.length },
    { key: "loans", label: "Loans", count: loans.length },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Buyer portal</span>
      <h1 className="font-display text-3xl text-ink mt-2">Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
      <p className="text-sm text-ink-soft mt-2">Everything for your home search in one place.</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-7 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "border-orange bg-orange-pale text-orange-deep" : "border-border text-ink-soft"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="font-mono text-xs bg-white border border-border rounded-full px-2 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/search" className="bg-white border border-border rounded-xl2 p-5 hover:border-orange transition">
              <span className="font-display text-lg text-ink">Buy a home</span>
              <span className="block text-xs text-ink-soft mt-1">Search owner listings</span>
            </Link>
            <Link href="/projects" className="bg-white border border-border rounded-xl2 p-5 hover:border-orange transition">
              <span className="font-display text-lg text-ink">New projects</span>
              <span className="block text-xs text-ink-soft mt-1">RERA-verified builders</span>
            </Link>
            <Link href="/emi-calculator" className="bg-white border border-border rounded-xl2 p-5 hover:border-orange transition">
              <span className="font-display text-lg text-ink">EMI calculator</span>
              <span className="block text-xs text-ink-soft mt-1">Plan your budget</span>
            </Link>
            <Link href="/loans/apply" className="bg-white border border-border rounded-xl2 p-5 hover:border-orange transition">
              <span className="font-display text-lg text-ink">Home loan</span>
              <span className="block text-xs text-ink-soft mt-1">Apply in minutes</span>
            </Link>
          </div>
          <div className="mt-6 bg-white border border-border rounded-xl2 p-5">
            <p className="text-sm text-ink-soft">
              {favorites.length > 0
                ? `You've saved ${favorites.length} propert${favorites.length === 1 ? "y" : "ies"}.`
                : "Save properties you like with the heart button to see them here."}
            </p>
            <p className="text-sm text-ink-soft mt-1">
              {loans.length > 0
                ? `You have ${loans.length} loan application${loans.length === 1 ? "" : "s"}.`
                : "When you're ready, apply for a home loan and track it here."}
            </p>
          </div>
        </div>
      )}

      {tab === "favorites" && (
        <div className="mt-6 space-y-3">
          {favorites.length === 0 && <p className="text-sm text-ink-soft">No favorites yet. Save listings or projects with the heart button.</p>}
          {favorites.map((favorite) => {
            const href = favorite.targetType === "LISTING"
              ? `/property/${favorite.targetId}`
              : `/projects/${favorite.targetId}`;
            const title = favorite.targetType === "LISTING"
              ? `${favorite.listing?.bhk} BHK · ${favorite.listing?.locality}`
              : favorite.project?.name ?? "Project";
            const sub = favorite.targetType === "LISTING"
              ? formatPrice(favorite.listing?.price ?? 0)
              : favorite.project?.locality ?? "";
            const image = favorite.targetType === "LISTING"
              ? favorite.listing?.images?.[0]
              : favorite.project?.images?.[0];
            return (
              <Link key={favorite.id} href={href} className="block">
                <div className="bg-white border border-border rounded-xl2 overflow-hidden flex items-stretch hover:border-orange transition">
                  <div className="relative h-20 w-24 shrink-0 bg-gradient-to-br from-orange-pale to-orange">
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4 p-5">
                    <div>
                      <div className="font-mono font-semibold text-ink">{sub}</div>
                      <div className="text-sm text-ink-soft">{title}</div>
                    </div>
                    <span className="text-xs font-mono text-orange-deep font-bold uppercase">{favorite.targetType}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {tab === "searches" && (
        <div className="mt-6 space-y-3">
          {searches.length === 0 && (
            <p className="text-sm text-ink-soft">
              No saved searches. Apply filters on the{" "}
              <Link href="/search" className="font-semibold text-orange-deep">search page</Link> and save them.
            </p>
          )}
          {searches.map((search) => (
            <div key={search.id} className="bg-white border border-border rounded-xl2 p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{search.name}</p>
                <p className="text-xs text-ink-soft mt-0.5 font-mono">
                  {search.filters.locality || "Any locality"}
                  {search.filters.bhk ? ` · ${search.filters.bhk} BHK` : ""}
                  {search.filters.minPrice ? ` · ≥ ₹${search.filters.minPrice.toLocaleString("en-IN")}` : ""}
                  {search.filters.maxPrice ? ` · ≤ ₹${search.filters.maxPrice.toLocaleString("en-IN")}` : ""}
                </p>
              </div>
              <Link href={searchHref(search.filters)} className="text-sm font-semibold text-orange-deep">
                Run search →
              </Link>
            </div>
          ))}
        </div>
      )}

      {tab === "inquiries" && (
        <div className="mt-6 space-y-3">
          {inquiries.length === 0 && <p className="text-sm text-ink-soft">No inquiries yet. Ask about a project from its detail page.</p>}
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white border border-border rounded-xl2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{inquiry.projectName}</span>
                <span className="text-xs font-mono text-ink-faint">
                  {new Date(inquiry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              {inquiry.unitType && <p className="text-xs text-ink-soft mt-1 font-mono">Unit: {inquiry.unitType}</p>}
              {inquiry.message && <p className="text-sm text-ink-soft mt-1">{inquiry.message}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "loans" && (
        <div className="mt-6 space-y-3">
          {loans.length === 0 && (
            <p className="text-sm text-ink-soft">
              No loan applications yet.{" "}
              <Link href="/loans/apply" className="font-semibold text-orange-deep">Apply for a home loan</Link> and track it here.
            </p>
          )}
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white border border-border rounded-xl2 p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-mono font-semibold text-ink">{formatPrice(loan.loanAmount)}</div>
                <p className="text-sm text-ink-soft mt-0.5">
                  Home {formatPrice(loan.propertyPrice)} · {loan.tenureYears} yrs @ {loan.interestRate}%
                </p>
                <p className="text-xs text-ink-faint mt-0.5 font-mono">
                  Income ₹{loan.monthlyIncome.toLocaleString("en-IN")}/mo · {loan.employmentType.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full ${loanStatusStyles[loan.status]}`}>
                {loan.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
