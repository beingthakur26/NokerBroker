import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SavedSearch from "@/models/SavedSearch";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.alertsOn !== "boolean") return NextResponse.json({ error: "alertsOn must be a boolean" }, { status: 422 });
  const { id } = await params;
  await dbConnect();
  const search = await SavedSearch.findOneAndUpdate({ _id: id, userId: session.user.id }, { alertsOn: body.alertsOn }, { new: true }).lean();
  if (!search) return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
  return NextResponse.json({ search });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await dbConnect();
  const result = await SavedSearch.deleteOne({ _id: id, userId: session.user.id });
  if (!result.deletedCount) return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
