import { NextResponse } from "next/server";
import { deliverSavedSearchMatches } from "@/lib/saved-search-delivery";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, delivered: await deliverSavedSearchMatches() });
}
