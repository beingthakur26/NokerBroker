"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Gallery } from "../../../components/property/Gallery";
import { Button } from "../../../components/ui/Button";
import { VerifiedStamp } from "../../../components/ui/VerifiedStamp";
import { useSession } from "../../../lib/useSession";
import { apiPost } from "../../../lib/api-client";
import { formatPrice } from "../../../lib/formatPrice";

interface Unit {
  id: string;
  type: string;
  areaSqft: number;
  price: number;
  floor: string;
  availableUnits: number;
}

interface ProjectDetail {
  id: string;
  name: string;
  locality: string;
  pinCode: string;
  address: string;
  description: string;
  reraId: string;
  images: string[];
  amenities: string[];
  possessionDate: string | null;
  constructionStatus: string;
  status: string;
  createdAt: string;
  builder: {
    name: string;
    companyName: string;
    phone: string;
    verified: boolean;
  } | null;
  units: Unit[];
}

const constructionLabels: Record<string, string> = {
  UNDER_CONSTRUCTION: "Under construction",
  READY_TO_MOVE: "Ready to move",
  COMPLETED: "Completed",
};

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

function telHref(phone: string) {
  return `tel:+${phone.replace(/\D/g, "")}`;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: sessionLoading } = useSession();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saved, setSaved] = useState(false);
  const [inquiry, setInquiry] = useState<{ unitType: string; open: boolean }>({ unitType: "", open: false });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [inquiryState, setInquiryState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [inquiryError, setInquiryError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${params.id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Unable to load the project");
        if (active) setProject(data?.project ?? null);
      })
      .then(() => active && setState("ready"))
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [params.id]);

  async function toggleSave() {
    if (!project) return;
    if (saved) return;
    setSaved(true);
    try {
      await apiPost("/me/favorites", { targetType: "PROJECT", targetId: project.id });
    } catch {
      setSaved(false);
    }
  }

  async function submitInquiry() {
    if (!project) return;
    setInquiryState("sending");
    setInquiryError("");
    try {
      await apiPost("/inquiries", {
        projectId: project.id,
        name,
        phone,
        message: message || undefined,
        unitType: inquiry.unitType || undefined,
      });
      setInquiryState("done");
    } catch (err) {
      setInquiryState("error");
      setInquiryError(err instanceof Error ? err.message : "Unable to send inquiry");
    }
  }

  if (state === "loading") {
    return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  }

  if (state === "error" || !project) {
    return (
      <main className="max-w-2xl mx-auto py-20 px-6 text-center">
        <h1 className="font-display text-2xl text-ink">Project not found</h1>
        <p className="text-sm text-ink-soft mt-2">It may have been removed or is not live yet.</p>
        <Link href="/projects" className="mt-6 inline-block text-sm font-semibold text-orange-deep">← Back to projects</Link>
      </main>
    );
  }

  const priceFrom = project.units.reduce((min, unit) => Math.min(min, unit.price), Number.POSITIVE_INFINITY);
  const priceLabel = Number.isFinite(priceFrom) ? formatPrice(priceFrom) : "—";

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <Link href="/projects" className="text-sm font-semibold text-ink-soft hover:text-orange-deep">← Back to projects</Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-9">
        <Gallery images={project.images} alt={project.name} />

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-ink text-white">NO BROKERAGE</span>
                {project.builder?.verified && <VerifiedStamp size="sm" label="VERIFIED" sublabel="RERA" />}
              </div>
              <h1 className="font-display text-3xl text-ink mt-4">{project.name}</h1>
              <div className="text-sm text-ink-soft mt-1">
                {project.locality} · {project.pinCode}
              </div>
              {project.address && <div className="text-xs text-ink-faint mt-0.5">{project.address}</div>}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <span className="block text-[10.5px] font-mono uppercase tracking-widest text-ink-soft">Starting from</span>
              <div className="font-mono text-2xl font-semibold text-ink">{priceLabel}</div>
            </div>
            <div>
              <span className="block text-[10.5px] font-mono uppercase tracking-widest text-ink-soft">Status</span>
              <div className="text-sm font-semibold text-ink mt-1">{constructionLabels[project.constructionStatus] ?? project.constructionStatus}</div>
            </div>
            {project.possessionDate && (
              <div>
                <span className="block text-[10.5px] font-mono uppercase tracking-widest text-ink-soft">Possession</span>
                <div className="text-sm font-semibold text-ink mt-1">
                  {new Date(project.possessionDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 bg-bg-warm border border-border rounded-xl2 p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-deep mb-2">Developer</p>
            <p className="text-sm font-semibold text-ink">
              {project.builder?.companyName || project.builder?.name || "Verified builder"}
            </p>
            <p className="text-xs text-ink-soft mt-0.5">RERA ID: {project.reraId}</p>
            {project.builder?.phone && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
                <a href={telHref(project.builder.phone)} className="flex-1">
                  <Button variant="outline" block>Call developer</Button>
                </a>
                <a href={whatsappHref(project.builder.phone)} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="whatsapp" block>WhatsApp</Button>
                </a>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/loans/apply?price=${Math.round(priceFrom)}`}
              className="flex-1"
            >
              <Button variant="primary" block>Apply for a loan</Button>
            </Link>
            {!sessionLoading && user ? (
              <Button variant="outline" block onClick={toggleSave}>
                {saved ? "Saved ✓" : "Save project"}
              </Button>
            ) : (
              <Link href="/login" className="flex-1">
                <Button variant="outline" block>Save project</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink">About this project</h2>
        <p className="text-sm text-ink-soft mt-3 leading-relaxed max-w-[720px]">{project.description}</p>
        {project.amenities.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.amenities.map((amenity) => (
              <span key={amenity} className="text-xs px-3.5 py-1.5 rounded-full border-[1.5px] border-border text-ink-soft">
                {amenity}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink">Units & pricing</h2>
        <div className="mt-4 overflow-x-auto rounded-xl2 border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-mono uppercase tracking-widest text-ink-soft">
                <th className="px-5 py-3.5">Unit type</th>
                <th className="px-5 py-3.5">Area</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Availability</th>
                <th className="px-5 py-3.5 text-right">Inquire</th>
              </tr>
            </thead>
            <tbody>
              {project.units.map((unit) => (
                <tr key={unit.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-semibold text-ink">{unit.type}</td>
                  <td className="px-5 py-4 font-mono text-ink-soft">{unit.areaSqft.toLocaleString("en-IN")} sq.ft</td>
                  <td className="px-5 py-4 font-mono font-semibold text-ink">{formatPrice(unit.price)}</td>
                  <td className="px-5 py-4 text-xs text-ink-soft">
                    {unit.availableUnits > 0 ? `${unit.availableUnits} available` : "Sold out"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="outline"
                      onClick={() => setInquiry({ unitType: unit.type, open: true })}
                    >
                      Inquire
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(inquiry.open || inquiryState === "done") && (
        <section className="mt-10 bg-white border border-border rounded-xl2 p-6 max-w-[560px]">
          {inquiryState === "done" ? (
            <div>
              <h3 className="font-display text-xl text-ink">Inquiry sent 🎉</h3>
              <p className="text-sm text-ink-soft mt-2">
                The developer will reach out on {phone}. You can also call or WhatsApp them directly above.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setInquiryState("idle");
                  setInquiry({ unitType: "", open: false });
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="font-display text-xl text-ink">
                Inquire about {inquiry.unitType ? `${inquiry.unitType} at ` : ""}{project.name}
              </h3>
              <div className="mt-4 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919812345678"
                  className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything specific you'd like to know? (optional)"
                  rows={3}
                  className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm resize-none"
                />
                {inquiryState === "error" && <p className="text-sm text-red-600">{inquiryError}</p>}
                <div className="flex gap-2.5">
                  <Button variant="accent" onClick={submitInquiry} disabled={inquiryState === "sending" || !name.trim() || !phone.trim()}>
                    {inquiryState === "sending" ? "Sending…" : "Send inquiry"}
                  </Button>
                  <Button variant="ghost" onClick={() => setInquiry({ unitType: "", open: false })}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
