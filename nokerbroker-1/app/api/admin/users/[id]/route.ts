import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { toUserView } from "@/lib/serialize";

const ROLES = ["USER", "ADMIN"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const role = String(body.role ?? "").toUpperCase();
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 422 });
  }

  if (session.user?.id === id && role !== "ADMIN") {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 403 });
  }

  await dbConnect();
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user: toUserView(user) });
}
