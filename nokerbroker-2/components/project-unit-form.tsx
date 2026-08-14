"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToastManager } from "@/components/ui/toast";

export function ProjectUnitForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const toasts = useToastManager();
  const [saving, setSaving] = useState(false);
  const [unitType, setUnitType] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [floorPlanUrl, setFloorPlanUrl] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitType, priceFrom: Number(priceFrom), priceTo: priceTo ? Number(priceTo) : undefined, areaSqft: Number(areaSqft), floorPlanUrl: floorPlanUrl || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not add unit");
      setUnitType(""); setPriceFrom(""); setPriceTo(""); setAreaSqft(""); setFloorPlanUrl("");
      toasts.add({ type: "success", title: "Unit configuration added" });
      router.refresh();
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not add unit" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="unit-editor" style={{ marginTop: 20 }}>
      <input value={unitType} onChange={(event) => setUnitType(event.target.value)} placeholder="3 BHK" aria-label="Unit type" required />
      <input value={priceFrom} onChange={(event) => setPriceFrom(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Price from" aria-label="Price from" required />
      <input value={priceTo} onChange={(event) => setPriceTo(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Price to" aria-label="Price to" />
      <input value={areaSqft} onChange={(event) => setAreaSqft(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Area sqft" aria-label="Area in square feet" required />
      <input value={floorPlanUrl} onChange={(event) => setFloorPlanUrl(event.target.value)} inputMode="url" placeholder="Floor plan URL (optional)" aria-label="Floor plan URL" />
      <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add unit"}</button>
    </form>
  );
}
