"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../../lib/useSession";
import { formatPrice } from "../../../lib/formatPrice";

interface MyProject {
  id: string;
  name: string;
  locality: string;
  pinCode: string;
  images: string[];
  status: "PENDING" | "LIVE" | "REJECTED" | "PAUSED";
  unitCount: number;
  priceFrom: number | null;
  createdAt: string;
}

interface Lead {
  id: string;
  projectName: string;
  name: string;
  phone: string;
  message: string;
  unitType: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-orange-pale text-orange-deep",
  LIVE: "bg-verified-bg text-verified",
  REJECTED: "bg-red-100 text-red-700",
  PAUSED: "bg-[#EFEAE6] text-ink-soft",
};

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: "include" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Unable to load");
  return data as T;
}

export default function BuilderDashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user && user.role !== "BUILDER") {
      router.replace("/profile");
      return;
    }
    if (!loading && user?.role === "BUILDER") {
      void Promise.all([api<{ projects: MyProject[] }>("/projects/mine"), api<{ inquiries: Lead[] }>("/inquiries/mine")])
        .then(([p, i]) => {
          setProjects(p.projects);
          setLeads(i.inquiries);
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load your dashboard"));
    }
  }, [user, loading, router]);

  if (loading || !user) return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  if (user.role !== "BUILDER") return <p className="text-center mt-20 text-ink-soft">Redirecting...</p>;

  const liveCount = projects.filter((p) => p.status === "LIVE").length;
  const pendingCount = projects.filter((p) => p.status === "PENDING").length;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Builder portal</span>
      <h1 className="font-display text-3xl text-ink mt-2">
        {user.companyName || "Your projects"}
      </h1>

      {!user.verified && (
        <div className="mt-6 bg-orange-pale/50 border border-orange/30 rounded-xl2 p-6">
          <h2 className="font-display text-xl text-ink">Verification pending</h2>
          <p className="text-sm text-ink-soft mt-2 max-w-[560px] leading-relaxed">
            Your builder account is being reviewed. Once our team verifies your company
            <span className="font-semibold text-ink"> {user.companyName || "details"} </span>
            and RERA ID
            <span className="font-mono font-semibold text-ink"> {user.reraId || "—"} </span>,
            you&apos;ll be able to publish projects. This usually takes less than a day.
          </p>
        </div>
      )}

      {user.verified && (
        <>
          <div className="mt-7 grid grid-cols-3 gap-4">
            <div className="bg-white border border-border rounded-xl2 p-5">
              <span className="font-mono text-2xl block text-ink">{projects.length}</span>
              <span className="text-xs text-ink-soft">Projects</span>
            </div>
            <div className="bg-white border border-border rounded-xl2 p-5">
              <span className="font-mono text-2xl block text-ink">{liveCount}</span>
              <span className="text-xs text-ink-soft">Live</span>
            </div>
            <div className="bg-white border border-border rounded-xl2 p-5">
              <span className="font-mono text-2xl block text-ink">{pendingCount}</span>
              <span className="text-xs text-ink-soft">Awaiting approval</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">My projects</h2>
            <Link href="/dashboard/builder/new" className="inline-flex items-center justify-center rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(244,96,15,0.28)] transition hover:bg-orange-deep">
              + Create project
            </Link>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {projects.length === 0 && (
            <p className="mt-4 text-sm text-ink-soft">
              No projects yet. Create your first project to start collecting leads.
            </p>
          )}

          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-border rounded-xl2 overflow-hidden flex items-stretch">
                <div className="relative h-24 w-28 shrink-0 bg-gradient-to-br from-orange-pale to-orange">
                  {project.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.images[0]} alt={project.name} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <Link href={`/projects/${project.id}`} className="font-semibold text-ink hover:text-orange-deep">
                      {project.name}
                    </Link>
                    <div className="text-sm text-ink-soft mt-0.5">
                      {project.locality} · {project.pinCode}
                    </div>
                    <div className="font-mono text-sm text-ink mt-1">
                      {project.priceFrom ? `From ${formatPrice(project.priceFrom)}` : "No units yet"} · {project.unitCount} unit{project.unitCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full ${statusStyles[project.status]}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-display text-xl text-ink mt-10">Leads</h2>
          {leads.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No inquiries yet. Buyers will reach out from your project pages.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white border border-border rounded-xl2 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">{lead.projectName}</span>
                    <span className="text-xs font-mono text-ink-faint">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-sm text-ink mt-2">
                    {lead.name} · <span className="font-mono">{lead.phone}</span>
                    {lead.unitType && <span className="text-ink-soft"> · {lead.unitType}</span>}
                  </p>
                  {lead.message && <p className="text-sm text-ink-soft mt-1">{lead.message}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
