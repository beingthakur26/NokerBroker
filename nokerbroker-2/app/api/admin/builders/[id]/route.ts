import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import BuilderProfile from "@/models/BuilderProfile";

const STATUSES = ["VERIFIED", "DENIED"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const status = String(body.status ?? "").toUpperCase();
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid review decision" }, { status: 422 });

  await dbConnect();
  const profile = await BuilderProfile.findByIdAndUpdate(
    id,
    { status, verifiedAt: status === "VERIFIED" ? new Date() : undefined },
    { new: true }
  ).lean();
  if (!profile) return NextResponse.json({ error: "Builder profile not found" }, { status: 404 });
  return NextResponse.json({ profile });
}
