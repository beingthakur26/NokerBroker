"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToastManager } from "@/components/ui/toast";
import { ImageUploader } from "@/components/image-uploader";

const STATUSES = ["UNDER_CONSTRUCTION", "PRE_LAUNCH", "READY_TO_MOVE"];

interface UnitRow {
  unitType: string;
  priceFrom: string;
  priceTo: string;
  areaSqft: string;
}

export function ProjectForm({ reraNumber }: { reraNumber: string }) {
  const router = useRouter();
  const toasts = useToastManager();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [locality, setLocality] = useState("");
  const [zone, setZone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("UNDER_CONSTRUCTION");
  const [progressPct, setProgressPct] = useState("");
  const [possessionDate, setPossessionDate] = useState("");
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([
    { unitType: "2 BHK", priceFrom: "", priceTo: "", areaSqft: "" },
  ]);

  const valid =
    name.trim() &&
    locality.trim() &&
    pinCode.trim().length === 6 &&
    units.every((unit) => unit.unitType.trim() && Number(unit.priceFrom) > 0 && Number(unit.areaSqft) > 0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          locality,
          zone,
          pinCode,
          description,
          constructionStatus: status,
          progressPct: Number(progressPct) || 0,
          possessionDate: possessionDate || undefined,
          amenities: amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          images,
          units: units.map((unit) => ({
            unitType: unit.unitType.trim(),
            priceFrom: Number(unit.priceFrom),
            priceTo: Number(unit.priceTo) || undefined,
            areaSqft: Number(unit.areaSqft),
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not list your project");
      toasts.add({ type: "success", title: "Your project is live" });
      router.push("/dashboard/projects");
      router.refresh();
    } catch (error) {
      toasts.add({
        type: "error",
        title: error instanceof Error ? error.message : "Could not list your project",
      });
      setSubmitting(false);
    }
  }

  return (
    <form className="listing-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="search-field form-field">
          <label htmlFor="pj-name">Project name</label>
          <input id="pj-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Orchid Residency" required />
        </div>
        <div className="search-field form-field">
          <label htmlFor="pj-locality">Locality</label>
          <input id="pj-locality" value={locality} onChange={(event) => setLocality(event.target.value)} placeholder="Powai" required />
        </div>
        <div className="search-field form-field">
          <label htmlFor="pj-zone">Zone (optional)</label>
          <input id="pj-zone" value={zone} onChange={(event) => setZone(event.target.value)} placeholder="Central Suburbs" />
        </div>
        <div className="search-field form-field">
          <label htmlFor="pj-pin">PIN code</label>
          <input id="pj-pin" inputMode="numeric" maxLength={6} value={pinCode} onChange={(event) => setPinCode(event.target.value.replace(/\D/g, ""))} placeholder="400076" required />
        </div>
        <div className="search-field form-field">
          <label>Approved RERA number</label>
          <p className="px-3 py-2 text-sm font-mono text-ink">{reraNumber}</p>
        </div>
        <div className="search-field form-field">
          <label htmlFor="pj-status">Construction status</label>
          <select id="pj-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map((option) => (
              <option key={option} value={option}>{option.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="search-field form-field">
          <label htmlFor="pj-progress">Progress %</label>
          <input id="pj-progress" inputMode="numeric" value={progressPct} onChange={(event) => setProgressPct(event.target.value.replace(/[^\d]/g, ""))} placeholder="45" />
        </div>
        <div className="search-field form-field">
          <label htmlFor="pj-possession">Possession date</label>
          <input id="pj-possession" type="date" value={possessionDate} onChange={(event) => setPossessionDate(event.target.value)} />
        </div>
      </div>

      <div className="search-field form-field">
        <label htmlFor="pj-desc">Description</label>
        <textarea id="pj-desc" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Garden township with a clubhouse, jogging track and landscaped courts…" />
      </div>

      <div className="form-field">
        <label>Unit configurations</label>
        {units.map((unit, index) => (
          <div className="unit-editor" key={index}>
            <input
              value={unit.unitType}
              onChange={(event) => setUnits(units.map((item, i) => (i === index ? { ...item, unitType: event.target.value } : item)))}
              placeholder="2 BHK"
              aria-label="Unit type"
            />
            <input
              value={unit.priceFrom}
              inputMode="numeric"
              onChange={(event) => setUnits(units.map((item, i) => (i === index ? { ...item, priceFrom: event.target.value.replace(/[^\d]/g, "") } : item)))}
              placeholder="Price from ₹"
              aria-label="Price from"
            />
            <input
              value={unit.priceTo}
              inputMode="numeric"
              onChange={(event) => setUnits(units.map((item, i) => (i === index ? { ...item, priceTo: event.target.value.replace(/[^\d]/g, "") } : item)))}
              placeholder="Price to ₹ (optional)"
              aria-label="Price to"
            />
            <input
              value={unit.areaSqft}
              inputMode="numeric"
              onChange={(event) => setUnits(units.map((item, i) => (i === index ? { ...item, areaSqft: event.target.value.replace(/[^\d]/g, "") } : item)))}
              placeholder="Area sqft"
              aria-label="Area sqft"
            />
            {units.length > 1 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setUnits(units.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="link-more"
          onClick={() => setUnits([...units, { unitType: "", priceFrom: "", priceTo: "", areaSqft: "" }])}
        >
          + Add another unit type
        </button>
      </div>

      <div className="search-field form-field">
        <label htmlFor="pj-amenities">Amenities (comma separated)</label>
        <input id="pj-amenities" value={amenities} onChange={(event) => setAmenities(event.target.value)} placeholder="Clubhouse, Gym, Swimming pool" />
      </div>

      <div className="form-field">
        <label>Project photos</label>
        <ImageUploader value={images} onChange={setImages} label="Add project photos" />
      </div>

      <div className="wizard-nav">
        <button className="btn btn-primary" type="submit" disabled={!valid || submitting}>
          {submitting ? "Publishing…" : "Publish project"}
        </button>
      </div>
    </form>
  );
}
