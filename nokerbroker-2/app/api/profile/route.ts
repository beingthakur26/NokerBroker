import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { toUserView } from "@/lib/serialize";
import { isValidIndianNumber, normalizeIndianNumber } from "@/lib/phone";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }
  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user: toUserView(user) });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : undefined;
  const city = typeof body.city === "string" ? body.city.trim().slice(0, 80) : undefined;
  const locality = typeof body.locality === "string" ? body.locality.trim().slice(0, 80) : undefined;
  const rawWhatsapp = typeof body.whatsappNumber === "string" ? body.whatsappNumber.trim() : undefined;

  const updates: Record<string, unknown> = {};
  if (name) updates.name = name;
  if (city !== undefined) updates.city = city;
  if (locality !== undefined) updates.locality = locality;
  if (rawWhatsapp !== undefined) {
    if (!isValidIndianNumber(rawWhatsapp)) {
      return NextResponse.json({ error: "Enter a valid 10-digit Indian WhatsApp number" }, { status: 422 });
    }
    updates.whatsappNumber = normalizeIndianNumber(rawWhatsapp);
    updates.whatsappVerified = false;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 422 });
  }

  await dbConnect();
  let user;
  try {
    user = await User.findByIdAndUpdate(session.user.id, updates, { new: true }).lean();
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "This WhatsApp number is already linked to another account" }, { status: 409 });
    }
    throw error;
  }
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user: toUserView(user) });
}
