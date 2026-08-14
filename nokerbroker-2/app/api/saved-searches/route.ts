import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SavedSearch from "@/models/SavedSearch";
import { normalizeSavedSearchFilters } from "@/lib/saved-searches";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const searches = await SavedSearch.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ searches });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  const filters = normalizeSavedSearchFilters(body?.filters);
  if (!title || !filters) {
    return NextResponse.json({ error: "A title and at least one search filter are required" }, { status: 422 });
  }
  await dbConnect();
  const search = await SavedSearch.create({ userId: session.user.id, title, filters, alertsOn: body.alertsOn !== false });
  return NextResponse.json({ search }, { status: 201 });
}
