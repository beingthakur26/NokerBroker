"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/useSession";
import { Button } from "../../components/ui/Button";

type Tab = "listings" | "projects" | "builders";

interface PendingListing {
  id: string;
  type: string;
  locality: string;
  pinCode: string;
  price: number;
  areaSqft: number;
  bhk: number;
  images: string[];
  status: string;
  createdAt: string;
  owner: { name: string; phone: string } | null;
  ownershipDocUrl: string | null;
}

interface PendingProject {
  id: string;
  name: string;
  locality: string;
  pinCode: string;
  reraId: string;
  images: string[];
  status: string;
  createdAt: string;
  builder: { name: string; companyName: string; phone: string } | null;
}

interface PendingBuilder {
  id: string;
  name: string;
  phone: string;
  companyName: string;
  reraId: string;
  verified: boolean;
  createdAt: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: "include", ...init });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Something went wrong");
  return data as T;
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-full bg-orange-pale text-orange-deep uppercase">
      {label}
    </span>
  );
}

function Money({ value }: { value: number }) {
  if (value >= 10_000_000) return <>{`₹${(value / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`}</>;
  if (value >= 100_000) return <>{`₹${(value / 100_000).toFixed(1).replace(/\.0$/, "")} L`}</>;
  return <>{`₹${value.toLocaleString("en-IN")}`}</>;
}

export default function AdminPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [builders, setBuilders] = useState<PendingBuilder[]>([]);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    const [l, p, b] = await Promise.all([
      api<{ listings: PendingListing[] }>("/admin/listings?status=PENDING"),
      api<{ projects: PendingProject[] }>("/admin/projects?status=PENDING"),
      api<{ users: PendingBuilder[] }>("/admin/users?role=BUILDER&verified=false"),
    ]);
    return {
      listings: l.listings,
      projects: p.projects,
      builders: b.users,
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user && user.role !== "ADMIN") {
      router.replace("/profile");
      return;
    }
    if (!loading && user?.role === "ADMIN") {
      let active = true;
      refresh()
        .then((queue) => {
          if (active) {
            setListings(queue.listings);
            setProjects(queue.projects);
            setBuilders(queue.builders);
          }
        })
        .catch((err) => {
          if (active) setMessage(err instanceof Error ? err.message : "Unable to load the queue");
        });
      return () => {
        active = false;
      };
    }
  }, [loading, user, router, refresh]);

  async function act<T>(path: string, body?: unknown, okMessage = "Done") {
    setMessage("");
    try {
      await api<T>(path, {
        method: "PATCH",
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      setMessage(okMessage);
      const queue = await refresh();
      setListings(queue.listings);
      setProjects(queue.projects);
      setBuilders(queue.builders);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Action failed");
    }
  }

  function handleReject(listingId: string, reason: string) {
    void act(`/admin/listings/${listingId}/reject`, { reason }, "Listing rejected");
  }

  if (loading || !user) return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  if (user.role !== "ADMIN") return <p className="text-center mt-20 text-ink-soft">Redirecting...</p>;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "listings", label: "Listings", count: listings.length },
    { key: "projects", label: "Projects", count: projects.length },
    { key: "builders", label: "Builders to verify", count: builders.length },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Moderation</span>
      <h1 className="font-display text-3xl text-ink mt-2">Approval queue</h1>
      <p className="text-sm text-ink-soft mt-2">
        Nothing goes live until it&apos;s approved here. Every decision is recorded in the audit log.
      </p>

      {message && <p className="mt-4 text-sm text-ink-soft">{message}</p>}

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
            <span className="font-mono text-xs bg-white border border-border rounded-full px-2 py-0.5">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "listings" && (
        <div className="mt-6 space-y-3">
          {listings.length === 0 && <p className="text-sm text-ink-soft">No listings awaiting review.</p>}
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white border border-border rounded-xl2 p-5">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl2 bg-gradient-to-br from-orange-pale to-orange">
                  {listing.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.images[0]} alt={listing.locality} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-ink"><Money value={listing.price} /></span>
                    <StatusPill label={listing.status} />
                  </div>
                  <p className="text-sm text-ink mt-1">
                    {listing.bhk} BHK · {listing.areaSqft.toLocaleString("en-IN")} sq.ft · {listing.type.toLowerCase()}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {listing.locality} · {listing.pinCode} · posted{" "}
                    {new Date(listing.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    Owner: {listing.owner?.name || "—"} · {listing.owner?.phone || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {listing.ownershipDocUrl && (
                  <a href={listing.ownershipDocUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">View ownership doc</Button>
                  </a>
                )}
                <Button variant="accent" onClick={() => void act(`/admin/listings/${listing.id}/approve`, undefined, "Listing approved")}>
                  Approve
                </Button>
                <RejectButton
                  onReject={(reason) => handleReject(listing.id, reason)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "projects" && (
        <div className="mt-6 space-y-3">
          {projects.length === 0 && <p className="text-sm text-ink-soft">No projects awaiting review.</p>}
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-border rounded-xl2 p-5">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl2 bg-gradient-to-br from-orange-pale to-orange">
                  {project.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.images[0]} alt={project.name} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{project.name}</span>
                    <StatusPill label={project.status} />
                  </div>
                  <p className="text-xs text-ink-soft mt-1">
                    {project.locality} · {project.pinCode} · RERA {project.reraId}
                  </p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    Builder: {project.builder?.companyName || project.builder?.name || "—"} · {project.builder?.phone || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2.5">
                <Button variant="accent" onClick={() => void act(`/admin/projects/${project.id}/approve`, undefined, "Project approved")}>
                  Approve
                </Button>
                <RejectButton
                  onReject={(reason) => void act(`/admin/projects/${project.id}/reject`, { reason }, "Project rejected")}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "builders" && (
        <div className="mt-6 space-y-3">
          {builders.length === 0 && <p className="text-sm text-ink-soft">No builders waiting for verification.</p>}
          {builders.map((builder) => (
            <div key={builder.id} className="bg-white border border-border rounded-xl2 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{builder.companyName || builder.name}</span>
                <StatusPill label={builder.verified ? "verified" : "pending"} />
              </div>
              <p className="text-xs text-ink-soft mt-1">
                {builder.name || "—"} · {builder.phone} · RERA {builder.reraId}
              </p>
              <p className="text-xs text-ink-faint mt-0.5">
                Signed up {new Date(builder.createdAt).toLocaleDateString("en-IN")}
              </p>
              <div className="mt-4">
                <Button
                  variant="accent"
                  onClick={() => void act(`/admin/users/${builder.id}/verify`, { verified: true }, "Builder verified")}
                >
                  Verify builder
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RejectButton({ onReject }: { onReject: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Reject
      </Button>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for rejection…"
        className="flex-1 border-[1.5px] border-border rounded-full px-4 py-2.5 text-sm"
      />
      <Button
        variant="outline"
        disabled={reason.trim().length < 3}
        onClick={() => {
          onReject(reason.trim());
          setOpen(false);
          setReason("");
        }}
      >
        Confirm reject
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}
