export interface LocalitySuggestion { label: string; locality: string; latitude: number; longitude: number }

function token() { return process.env.MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN; }

export async function searchLocalities(query: string): Promise<LocalitySuggestion[]> {
  const accessToken = token();
  if (!accessToken || query.trim().length < 2) return [];
  const url = new URL(`https://api.mapbox.com/search/geocode/v6/forward/${encodeURIComponent(query.trim())}`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("limit", "6");
  url.searchParams.set("country", "in");
  url.searchParams.set("types", "neighborhood,locality,place,address");
  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) return [];
  const body = await response.json() as { features?: Array<{ properties?: { full_address?: string; name?: string; place_formatted?: string }; geometry?: { coordinates?: [number, number] } }> };
  return (body.features ?? []).flatMap((feature) => {
    const [longitude, latitude] = feature.geometry?.coordinates ?? [];
    const label = feature.properties?.full_address ?? feature.properties?.place_formatted ?? feature.properties?.name ?? "";
    const locality = feature.properties?.name ?? label.split(",")[0] ?? "";
    return label && locality && typeof latitude === "number" && typeof longitude === "number" && Number.isFinite(latitude) && Number.isFinite(longitude) ? [{ label, locality, latitude, longitude }] : [];
  });
}

export async function geocodeLocality(locality: string, pinCode?: string) {
  return (await searchLocalities(`${locality}${pinCode ? ` ${pinCode}` : ""}`))[0] ?? null;
}
