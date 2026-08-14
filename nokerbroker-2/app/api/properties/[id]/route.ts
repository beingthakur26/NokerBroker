import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { toPropertyView } from "@/lib/serialize";
import { propertyCreateSchema } from "@/lib/validation/listing";

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

  // Validate the merged document, not just the fields present in this request.
  // This keeps PATCH as strict as listing creation and avoids Mongoose cast errors.
  const candidate = {
    title: allowed.title ?? property.title,
    locality: allowed.locality ?? property.locality,
    pinCode: allowed.pinCode ?? property.pinCode,
    type: allowed.type ?? property.type,
    furnishing: allowed.furnishing ?? property.furnishing,
    price: allowed.price ?? property.price,
    areaSqft: allowed.areaSqft ?? property.areaSqft,
    ownershipDocUrl: property.ownershipDocUrl,
    zone: allowed.zone ?? property.zone,
    description: allowed.description ?? property.description,
    floor: allowed.floor ?? property.floor,
    bhk: allowed.bhk ?? property.bhk,
    images: allowed.images ?? property.images,
    amenities: allowed.amenities ?? property.amenities,
  };
  const validation = propertyCreateSchema.safeParse(candidate);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Invalid listing fields" }, { status: 422 });
  }
  Object.assign(allowed, validation.data);

  const status = String(body.status ?? "").toUpperCase();
  const adminStatuses = ["ACTIVE", "SOLD", "RENTED", "DRAFT", "ARCHIVED", "FLAGGED"];
  const ownerStatuses = ["ACTIVE", "SOLD", "RENTED", "DRAFT", "ARCHIVED"];
  if (status) {
    if (!admin && (!ownerStatuses.includes(status) || property.status === "FLAGGED")) {
      return NextResponse.json(
        { error: "Only an administrator can restore or change a flagged listing" },
        { status: 403 }
      );
    }
    if (!(admin ? adminStatuses : ownerStatuses).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    }
    allowed.status = status;
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
