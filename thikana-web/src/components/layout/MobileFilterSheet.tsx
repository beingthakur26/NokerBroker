"use client";

import { Button } from "../ui/Button";

export type PropertyType = "FLAT" | "VILLA" | "PLOT" | "COMMERCIAL";

const typeLabels: Record<PropertyType, string> = {
  FLAT: "Flat",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

const typeOptions: PropertyType[] = ["FLAT", "VILLA", "PLOT", "COMMERCIAL"];

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  type: PropertyType | "";
  setType: (value: PropertyType | "") => void;
  bhk: string;
  setBhk: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
}

export function MobileFilterSheet({
  open,
  onClose,
  onApply,
  onReset,
  type,
  setType,
  bhk,
  setBhk,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: MobileFilterSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter search results">
      <button
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[24px] bg-bg p-6 shadow-[0_-8px_40px_rgba(36,26,20,0.18)]">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Filters</h2>
          <button onClick={onClose} className="text-sm font-semibold text-ink-soft hover:text-ink">
            Close
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Property type</label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setType(type === option ? "" : option)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border-[1.5px] transition ${
                    type === option ? "bg-ink text-white border-ink" : "border-border text-ink-soft"
                  }`}
                >
                  {typeLabels[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">BHK</label>
            <select
              value={bhk}
              onChange={(event) => setBhk(event.target.value)}
              className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm bg-bg"
            >
              <option value="">Any</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4+">4+ BHK</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-ink block mb-1.5">Min price (₹)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="5000000"
                className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink block mb-1.5">Max price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="20000000"
                className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-7 flex gap-3">
          <Button variant="outline" block onClick={onReset}>
            Reset
          </Button>
          <Button variant="accent" block onClick={onApply}>
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
}
