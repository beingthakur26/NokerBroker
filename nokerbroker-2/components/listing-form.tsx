"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToastManager } from "@/components/ui/toast";
import { ImageUploader } from "@/components/image-uploader";

const TYPES = ["FLAT", "HOUSE", "PLOT", "VILLA", "OFFICE", "SHOP", "OTHER"];
const FURNISHING = ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"];
const STEPS = ["Type & location", "Price & size", "Details & media"];

interface ListingDraft {
  type?: string; title?: string; locality?: string; zone?: string; pinCode?: string;
  price?: number; areaSqft?: number; bhk?: number; floor?: string; furnishing?: string;
  description?: string; amenities?: string[]; images?: string[]; ownershipDocUrl?: string;
}

interface ListingFormProps {
  initialData?: ListingDraft;
}

export function ListingForm({ initialData }: ListingFormProps = {}) {
  const router = useRouter();
  const toasts = useToastManager();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState(initialData?.type || "FLAT");
  const [title, setTitle] = useState(initialData?.title || "");
  const [locality, setLocality] = useState(initialData?.locality || "");
  const [zone, setZone] = useState(initialData?.zone || "");
  const [pinCode, setPinCode] = useState(initialData?.pinCode || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [areaSqft, setAreaSqft] = useState(initialData?.areaSqft ? String(initialData.areaSqft) : "");
  const [bhk, setBhk] = useState(initialData?.bhk ? String(initialData.bhk) : "");
  const [floor, setFloor] = useState(initialData?.floor || "");
  const [furnishing, setFurnishing] = useState(initialData?.furnishing || "SEMI_FURNISHED");
  const [description, setDescription] = useState(initialData?.description || "");
  const [amenities, setAmenities] = useState(initialData?.amenities?.join(", ") || "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [docUrl, setDocUrl] = useState<string[]>(initialData?.ownershipDocUrl ? [initialData.ownershipDocUrl] : []);

  const stepValid =
    step === 0
      ? title.trim() && locality.trim() && pinCode.trim().length === 6
      : step === 1
        ? Number(price) > 0 && Number(areaSqft) > 0
        : docUrl.length > 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          locality,
          zone,
          pinCode,
          price: Number(price),
          areaSqft: Number(areaSqft),
          bhk: Number(bhk) || 0,
          floor,
          furnishing,
          description,
          amenities: amenities
            .split(",")
            .map((item: string) => item.trim())
            .filter(Boolean),
          images,
          ownershipDocUrl: docUrl[0],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not list your property");
      toasts.add({ type: "success", title: "Your listing is live" });
      router.push("/dashboard/listings");
      router.refresh();
    } catch (error) {
      toasts.add({
        type: "error",
        title: error instanceof Error ? error.message : "Could not list your property",
      });
      setSubmitting(false);
    }
  }

  return (
    <form className="listing-form" onSubmit={submit}>
      <div className="wizard-steps" aria-label="Progress">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`${index === step ? "active" : ""} ${index < step ? "done" : ""}`}
            onClick={() => index < step && setStep(index)}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="wizard-panel">
          <div className="form-grid">
            <div className="search-field form-field">
              <label htmlFor="lp-type">Property type</label>
              <select id="lp-type" value={type} onChange={(event) => setType(event.target.value)}>
                {TYPES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-title">Title</label>
              <input
                id="lp-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="2 BHK apartment in a gated society"
                required
              />
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-locality">Locality</label>
              <input
                id="lp-locality"
                value={locality}
                onChange={(event) => setLocality(event.target.value)}
                placeholder="Andheri West"
                required
              />
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-zone">Zone (optional)</label>
              <input
                id="lp-zone"
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                placeholder="Western Suburbs"
              />
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-pin">PIN code</label>
              <input
                id="lp-pin"
                inputMode="numeric"
                maxLength={6}
                value={pinCode}
                onChange={(event) => setPinCode(event.target.value.replace(/\D/g, ""))}
                placeholder="400053"
                required
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="wizard-panel">
          <div className="form-grid">
            <div className="search-field form-field">
              <label htmlFor="lp-price">Price (₹)</label>
              <input
                id="lp-price"
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="11500000"
                required
              />
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-area">Area (sqft)</label>
              <input
                id="lp-area"
                inputMode="numeric"
                value={areaSqft}
                onChange={(event) => setAreaSqft(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="820"
                required
              />
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-bhk">BHK (0 for plot/office)</label>
              <input
                id="lp-bhk"
                inputMode="numeric"
                value={bhk}
                onChange={(event) => setBhk(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="2"
              />
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-floor">Floor</label>
              <input
                id="lp-floor"
                value={floor}
                onChange={(event) => setFloor(event.target.value)}
                placeholder="4th floor"
              />
            </div>
            <div className="search-field form-field">
              <label htmlFor="lp-furnishing">Furnishing</label>
              <select
                id="lp-furnishing"
                value={furnishing}
                onChange={(event) => setFurnishing(event.target.value)}
              >
                {FURNISHING.map((option) => (
                  <option key={option} value={option}>{option.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-panel">
          <div className="search-field form-field">
            <label htmlFor="lp-desc">Description</label>
            <textarea
              id="lp-desc"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Sunny 2 BHK in a gated society, walking distance to the station…"
            />
          </div>
          <div className="search-field form-field">
            <label htmlFor="lp-amenities">Amenities (comma separated)</label>
            <input
              id="lp-amenities"
              value={amenities}
              onChange={(event) => setAmenities(event.target.value)}
              placeholder="Lift, Parking, Security, Power backup"
            />
          </div>
          <div className="form-field">
            <label>Photos</label>
            <ImageUploader value={images} onChange={setImages} label="Add photos" />
            <p className="form-hint">Add up to 5 clear photos of the property.</p>
          </div>
          <div className="form-field">
            <label>Ownership document (required to go live)</label>
            <ImageUploader value={docUrl} onChange={setDocUrl} multiple={false} label="Upload document" />
            <p className="form-hint">
              Upload a photo of your sale deed / agreement. It&apos;s kept private and never shown publicly —
              it&apos;s what makes your listing Verified.
            </p>
          </div>
        </div>
      )}

      <div className="wizard-nav">
        {step > 0 && (
          <button className="btn btn-ghost" type="button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!stepValid || submitting}
        >
          {submitting ? "Publishing…" : step < 2 ? "Continue" : "Publish listing"}
        </button>
      </div>
    </form>
  );
}
