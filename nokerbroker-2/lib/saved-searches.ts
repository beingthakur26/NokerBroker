import { matchesBudget } from "@/lib/properties";

export interface SavedSearchFilters {
  locality?: string;
  budget?: string;
  bhk?: string;
}

export function normalizeSavedSearchFilters(value: unknown): SavedSearchFilters | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const locality = typeof raw.locality === "string" ? raw.locality.trim().slice(0, 80) : "";
  const budget = typeof raw.budget === "string" ? raw.budget : "";
  const bhk = typeof raw.bhk === "string" ? raw.bhk : "";
  if (!locality && !budget && !bhk) return null;
  return { locality: locality || undefined, budget: budget || undefined, bhk: bhk || undefined };
}

export function matchesSavedSearch(
  filters: SavedSearchFilters,
  property: { locality: string; price: number; bhk?: number }
) {
  const localityMatch = !filters.locality || property.locality.toLowerCase().includes(filters.locality.toLowerCase());
  const budgetMatch = !filters.budget || filters.budget === "Any budget" || matchesBudget(property.price, filters.budget);
  const bhk = Number(filters.bhk);
  const bhkMatch = !filters.bhk || filters.bhk === "Any" || (filters.bhk === "4" ? (property.bhk ?? 0) >= 4 : property.bhk === bhk);
  return localityMatch && budgetMatch && bhkMatch;
}
