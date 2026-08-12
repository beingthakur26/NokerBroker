import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { toPropertyView } from "@/lib/serialize";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing property id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  await dbConnect();
  const property = await Property.findById(id);
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const admin = await isAdminSession();
  const isOwner = property.ownerId.toString() === session.user.id;
  if (!isOwner && !admin) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const allowed: Record<string, unknown> = {};
  const editable = ["title", "locality", "pinCode", "zone", "description", "floor", "type", "price", "areaSqft", "bhk", "furnishing", "images", "amenities"];
  for (const key of editable) {
    if (body[key] !== undefined) allowed[key] = body[key];
  }

  const statuses = ["ACTIVE", "SOLD", "RENTED", "DRAFT", "ARCHIVED", "FLAGGED"];
  if (body.status && statuses.includes(String(body.status))) {
    allowed.status = String(body.status);
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 422 });
  }

  property.set(allowed);
  await property.save();

  const refreshed = await Property.findById(id)
    .populate("ownerId", "name whatsappNumber whatsappVerified")
    .lean();

  return NextResponse.json({ property: toPropertyView(refreshed) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing property id" }, { status: 400 });

  await dbConnect();
  const property = await Property.findById(id);
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const admin = await isAdminSession();
  const isOwner = property.ownerId.toString() === session.user.id;
  if (!isOwner && !admin) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  await Property.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
