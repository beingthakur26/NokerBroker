"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/useSession";
import { Button } from "../../components/ui/Button";

export default function PostPropertyPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user && user.role !== "SELLER" && user.role !== "BUILDER") {
      router.replace("/profile");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  }

  if (!user || (user.role !== "SELLER" && user.role !== "BUILDER")) {
    return <p className="text-center mt-20 text-ink-soft">Redirecting...</p>;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const contentType = res.headers.get("content-type") ?? "";
      const data: unknown = contentType.includes("application/json")
        ? await res.json()
        : await res.text();
      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to submit the listing";
        throw new Error(message);
      }
      router.push("/dashboard/seller");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="font-display text-2xl text-ink mb-6">List your property — free, no brokerage</h2>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Property type</label>
          <select name="type" required className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm">
            <option value="FLAT">Flat / Apartment</option>
            <option value="VILLA">Villa / House</option>
            <option value="PLOT">Plot / Land</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Locality</label>
            <input name="locality" required placeholder="Andheri West" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Pin code</label>
            <input name="pinCode" required placeholder="400058" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Price (₹)</label>
            <input name="price" type="number" required placeholder="16500000" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Area (sq.ft)</label>
            <input name="areaSqft" type="number" required placeholder="720" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">BHK</label>
            <input name="bhk" type="number" required placeholder="2" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Sunlit 2 BHK on the 9th floor, near Metro station. Newly renovated kitchen, ample parking, gated society with 24x7 security…"
            className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm resize-none"
          />
        </div>
        <fieldset>
          <legend className="text-sm font-semibold text-ink mb-1.5">Amenities</legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Gymnasium",
              "Swimming pool",
              "Lift",
              "Parking",
              "24x7 Security",
              "Clubhouse",
              "Garden",
              "Children's play area",
              "Power backup",
              "CCTV",
              "Jogging track",
              "Home automation",
            ].map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2.5 text-sm text-ink border-[1.5px] border-border rounded-xl2 px-3.5 py-2.5 cursor-pointer hover:border-orange transition"
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  className="accent-orange"
                />
                {amenity}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Property photos (up to 10)</label>
          <input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple required className="w-full border-[1.5px] border-dashed border-border rounded-xl2 px-3.5 py-6 text-sm bg-bg-warm" />
        </div>
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">Ownership document</label>
          <p className="text-xs text-ink-soft mb-2">Required for approval — never shown publicly. Index-2 or latest property tax receipt.</p>
          <input type="file" name="ownershipDoc" accept="image/jpeg,image/png,application/pdf" required className="w-full border-[1.5px] border-dashed border-border rounded-xl2 px-3.5 py-6 text-sm bg-bg-warm" />
        </div>
        <Button type="submit" variant="accent" block disabled={submitting}>
          {submitting ? "Submitting..." : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
