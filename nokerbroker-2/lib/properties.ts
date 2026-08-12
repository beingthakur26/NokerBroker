export interface PropertyView {
  _id: string;
  slug: string;
  title: string;
  locality: string;
  pinCode: string;
  zone?: string;
  type: string;
  priceValue: number;
  areaSqft: number;
  floor: string;
  furnishing: string;
  bhk: number;
  verified: boolean;
  images: string[];
  description: string;
  amenities: string[];
  viewCount: number;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerWhatsapp: string;
}

export function formatPrice(value: number): string {
  if (value >= 1_00_00_000) {
    const crore = value / 1_00_00_000;
    const text = Number.isInteger(crore) ? `${crore}` : crore.toFixed(2).replace(/\.?0+$/, "");
    return `₹${text} Cr`;
  }
  if (value >= 1_00_000) {
    const lakh = value / 1_00_000;
    const text = Number.isInteger(lakh) ? `${lakh}` : lakh.toFixed(2).replace(/\.?0+$/, "");
    return `₹${text} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString("en-IN")} sqft`;
}

export function formatPriceFull(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export const budgetBuckets = [
  "Under ₹50 L",
  "₹50 L – ₹1 Cr",
  "₹1 Cr – ₹2 Cr",
  "₹2 Cr+",
] as const;

export type BudgetBucket = (typeof budgetBuckets)[number];

export function matchesBudget(priceValue: number, budget: string): boolean {
  switch (budget) {
    case "Under ₹50 L":
      return priceValue < 50_00_000;
    case "₹50 L – ₹1 Cr":
      return priceValue >= 50_00_000 && priceValue < 1_00_00_000;
    case "₹1 Cr – ₹2 Cr":
      return priceValue >= 1_00_00_000 && priceValue < 2_00_00_000;
    case "₹2 Cr+":
      return priceValue >= 2_00_00_000;
    default:
      return true;
  }
}

export interface PropertyFilters {
  locality?: string;
  budget?: string;
  bhk?: string;
  sort?: "recommended" | "price-low" | "price-high" | "area";
}

export function filterProperties(
  source: PropertyView[],
  filters: PropertyFilters
): PropertyView[] {
  let result = source.filter((property) => {
    const localityMatch =
      !filters.locality ||
      property.locality.toLowerCase().includes(filters.locality.toLowerCase());
    const bhkValue = Number(filters.bhk);
    const bhkMatch =
      !filters.bhk ||
      filters.bhk === "Any" ||
      property.bhk === bhkValue ||
      (filters.bhk === "4" && property.bhk >= 4);
    const budgetMatch =
      !filters.budget || filters.budget === "Any budget" || matchesBudget(property.priceValue, filters.budget);
    return localityMatch && bhkMatch && budgetMatch;
  });

  switch (filters.sort) {
    case "price-low":
      result = [...result].sort((a, b) => a.priceValue - b.priceValue);
      break;
    case "price-high":
      result = [...result].sort((a, b) => b.priceValue - a.priceValue);
      break;
    case "area":
      result = [...result].sort((a, b) => b.areaSqft - a.areaSqft);
      break;
    default:
      result = [...result].sort((a, b) => Number(b.verified) - Number(a.verified));
  }

  return result;
}

export function getRelatedProperties(current: PropertyView, all: PropertyView[], count = 3): PropertyView[] {
  return all
    .filter((property) => property.slug !== current.slug)
    .sort((a, b) => {
      const aScore =
        (a.locality === current.locality ? 2 : 0) + (a.bhk === current.bhk ? 1 : 0);
      const bScore =
        (b.locality === current.locality ? 2 : 0) + (b.bhk === current.bhk ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, count);
}
