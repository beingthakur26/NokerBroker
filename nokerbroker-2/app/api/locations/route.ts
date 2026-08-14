import { NextResponse } from "next/server";
import { searchLocalities } from "@/lib/mapbox";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });
  return NextResponse.json({ suggestions: await searchLocalities(query) });
}
