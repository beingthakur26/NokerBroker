"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { budgetBuckets } from "@/lib/properties";
import { LocalityAutocomplete } from "@/components/locality-autocomplete";

interface BuyFiltersProps {
  locality: string;
  budget: string;
  bhk: string;
  sort: string;
}

interface FilterState {
  locality: string;
  budget: string;
  bhk: string;
  sort: string;
}

const bhkOptions = [
  { value: "1", label: "1 RK / 1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK+" },
];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "area", label: "Area (largest first)" },
];

export function BuyFilters({ locality, budget, bhk, sort }: BuyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [localityInput, setLocalityInput] = useState(locality);
  const current = useRef<FilterState>({ locality, budget, bhk, sort });

  useEffect(() => {
    current.current = { locality, budget, bhk, sort };
  }, [locality, budget, bhk, sort]);

  useEffect(() => {
    if (localityInput !== current.current.locality) {
      setLocalityInput(current.current.locality);
    }
  }, [locality, localityInput]);

  const update = useCallback(
    (changes: Partial<FilterState>) => {
      const merged = { ...current.current, ...changes };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(merged)) {
        if (
          value &&
          value !== "Any" &&
          value !== "Any budget" &&
          value !== "recommended"
        ) {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    if (localityInput === current.current.locality) return;
    const id = setTimeout(() => update({ locality: localityInput }), 350);
    return () => clearTimeout(id);
  }, [localityInput, update]);

  return (
    <div className="buy-filters">
      <div className="buy-filter-field buy-filter-locality">
        <label htmlFor="buy-locality">Locality</label>
        <div className="buy-filter-input">
          <Search size={16} aria-hidden="true" />
          <LocalityAutocomplete id="buy-locality" value={localityInput} onChange={setLocalityInput} onSelect={(suggestion) => update({ locality: suggestion.locality })} placeholder="Any locality" />
          {localityInput && (
            <button
              type="button"
              aria-label="Clear locality"
              onClick={() => setLocalityInput("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="buy-filter-field">
        <label htmlFor="buy-budget">Budget</label>
        <Select
          value={budget}
          onValueChange={(value) => update({ budget: value ?? "Any budget" })}
        >
          <SelectTrigger id="buy-budget" className="w-full justify-between" data-size="default">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any budget">Any budget</SelectItem>
            {budgetBuckets.map((bucket) => (
              <SelectItem key={bucket} value={bucket}>{bucket}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="buy-filter-field">
        <label htmlFor="buy-bhk">BHK</label>
        <Select
          value={bhk}
          onValueChange={(value) => update({ bhk: value ?? "Any" })}
        >
          <SelectTrigger id="buy-bhk" className="w-full justify-between" data-size="default">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any</SelectItem>
            {bhkOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="buy-filter-field">
        <label htmlFor="buy-sort">Sort</label>
        <Select
          value={sort}
          onValueChange={(value) => update({ sort: value ?? "recommended" })}
        >
          <SelectTrigger id="buy-sort" className="w-full justify-between" data-size="default">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
