"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../../../lib/useSession";
import { Button } from "../../../../components/ui/Button";

interface UnitRow {
  type: string;
  areaSqft: string;
  price: string;
  floor: string;
  availableUnits: string;
}

const unitTypes = ["STUDIO", "1BHK", "2BHK", "3BHK", "4BHK", "PENTHOUSE", "COMMERCIAL"];

function emptyUnit(): UnitRow {
  return { type: "2BHK", areaSqft: "", price: "", floor: "", availableUnits: "1" };
}

export default function NewProjectPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [units, setUnits] = useState<UnitRow[]>([emptyUnit()]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  if (!user || user.role !== "BUILDER") return <p className="text-center mt-20 text-ink-soft">Redirecting...</p>;

  if (!user.verified) {
    return (
      <div className="max-w-lg mx-auto py-20 px-6 text-center">
        <h1 className="font-display text-2xl text-ink">Verification required</h1>
        <p className="text-sm text-ink-soft mt-2">
          Your builder account needs admin verification before you can create projects.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => router.replace("/dashboard/builder")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  function updateUnit(index: number, patch: Partial<UnitRow>) {
    setUnits((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const validUnits = units
      .filter((u) => u.areaSqft.trim() && u.price.trim())
      .map((u) => ({
        type: u.type,
        areaSqft: Number(u.areaSqft),
        price: Number(u.price),
        floor: u.floor.trim() || undefined,
        availableUnits: u.availableUnits ? Number(u.availableUnits) : undefined,
      }));

    if (validUnits.length === 0) {
      setError("Add at least one unit type with an area and price");
      setSubmitting(false);
      return;
    }

    formData.set("units", JSON.stringify(validUnits));

    const amenitiesRaw = String(formData.get("amenities") || "");
    const amenities = amenitiesRaw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)
      .slice(0, 20);
    if (amenities.length) formData.set("amenities", JSON.stringify(amenities));
    else formData.delete("amenities");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const contentType = res.headers.get("content-type") ?? "";
      const data: unknown = contentType.includes("application/json") ? await res.json() : await res.text();
      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to submit the project";
        throw new Error(message);
      }
      router.push("/dashboard/builder");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Builder portal</span>
      <h1 className="font-display text-2xl text-ink mt-2 mb-6">Create a new project</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <p className="text-sm text-ink-soft mb-5">
        Your project goes to our approval queue and appears on the site once approved.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Project name</label>
          <input name="name" required placeholder="e.g. Kalpataru Vivant" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Locality</label>
            <input name="locality" required placeholder="Thane West" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Pin code</label>
            <input name="pinCode" required placeholder="400601" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">RERA ID</label>
            <input name="reraId" required placeholder="P51900012345" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Full address (optional)</label>
          <input name="address" placeholder="Wing A, Kolshet Road, Thane West" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Describe the project, its USP, location advantages…"
            className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Construction status</label>
            <select name="constructionStatus" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm">
              <option value="UNDER_CONSTRUCTION">Under construction</option>
              <option value="READY_TO_MOVE">Ready to move</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Possession date (optional)</label>
            <input name="possessionDate" type="date" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Amenities (comma separated, optional)</label>
          <input name="amenities" placeholder="Gym, Swimming pool, Clubhouse, 24x7 security" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Project photos (up to 10)</label>
          <input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple required className="w-full border-[1.5px] border-dashed border-border rounded-xl2 px-3.5 py-6 text-sm bg-bg-warm" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink">Unit types</label>
            <Button type="button" variant="outline" onClick={() => setUnits((rows) => [...rows, emptyUnit()])}>
              + Add unit
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {units.map((unit, index) => (
              <div key={index} className="rounded-xl2 border border-border bg-bg-warm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-ink-soft">Unit {index + 1}</span>
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setUnits((rows) => rows.filter((_, i) => i !== index))}
                      className="text-xs font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-ink block mb-1">Type</label>
                    <select value={unit.type} onChange={(e) => updateUnit(index, { type: e.target.value })} className="w-full border-[1.5px] border-border rounded-xl2 px-2.5 py-2.5 text-sm bg-white">
                      {unitTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink block mb-1">Area (sq.ft)</label>
                    <input type="number" value={unit.areaSqft} onChange={(e) => updateUnit(index, { areaSqft: e.target.value })} className="w-full border-[1.5px] border-border rounded-xl2 px-2.5 py-2.5 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink block mb-1">Price (₹)</label>
                    <input type="number" value={unit.price} onChange={(e) => updateUnit(index, { price: e.target.value })} className="w-full border-[1.5px] border-border rounded-xl2 px-2.5 py-2.5 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink block mb-1">Floor (opt.)</label>
                    <input value={unit.floor} onChange={(e) => updateUnit(index, { floor: e.target.value })} placeholder="12–20" className="w-full border-[1.5px] border-border rounded-xl2 px-2.5 py-2.5 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-ink block mb-1">Available</label>
                    <input type="number" value={unit.availableUnits} onChange={(e) => updateUnit(index, { availableUnits: e.target.value })} className="w-full border-[1.5px] border-border rounded-xl2 px-2.5 py-2.5 text-sm bg-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" variant="accent" block disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for approval"}
        </Button>
      </form>
    </div>
  );
}
