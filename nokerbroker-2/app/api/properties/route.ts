import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { toPropertyView } from "@/lib/serialize";
import { slugify } from "@/lib/slugify";
import { matchesBudget } from "@/lib/properties";

const TYPES = ["FLAT", "HOUSE", "PLOT", "VILLA", "OFFICE", "SHOP", "OTHER"];
const FURNISHING = ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"];

export async function GET(request: Request) {
  await dbConnect();
  const url = new URL(request.url);
  const locality = url.searchParams.get("locality")?.toLowerCase() ?? "";
  const budget = url.searchParams.get("budget") ?? "";
  const bhk = url.searchParams.get("bhk") ?? "";
  const type = url.searchParams.get("type") ?? "";
  const status = url.searchParams.get("status") ?? "ACTIVE";

  const query: Record<string, unknown> = { status };
  if (locality) query.locality = new RegExp(locality, "i");
  if (type && TYPES.includes(type)) query.type = type;

  const docs = await Property.find(query)
    .populate("ownerId", "name whatsappNumber whatsappVerified")
    .sort({ createdAt: -1 })
    .lean();

  let views = docs.map(toPropertyView);
  if (budget) views = views.filter((property) => matchesBudget(property.priceValue, budget));
  if (bhk) {
    const bhkValue = Number(bhk);
    views = views.filter((property) =>
      bhk === "4" ? property.bhk >= 4 : property.bhk === bhkValue
    );
  }

  return NextResponse.json({ properties: views });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to list a property" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const locality = String(body.locality ?? "").trim();
  const pinCode = String(body.pinCode ?? "").trim();
  const type = String(body.type ?? "").toUpperCase();
  const furnishing = String(body.furnishing ?? "UNFURNISHED").toUpperCase();
  const price = Number(body.price);
  const areaSqft = Number(body.areaSqft);
  const ownershipDocUrl = String(body.ownershipDocUrl ?? "").trim();
  const images = Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [];
  const amenities = Array.isArray(body.amenities) ? body.amenities.map(String).filter(Boolean) : [];

  if (!title || !locality || !pinCode || !TYPES.includes(type) || !FURNISHING.includes(furnishing)) {
    return NextResponse.json({ error: "Missing or invalid listing fields" }, { status: 422 });
  }
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(areaSqft) || areaSqft <= 0) {
    return NextResponse.json({ error: "Price and area must be positive numbers" }, { status: 422 });
  }
  if (!ownershipDocUrl) {
    return NextResponse.json({ error: "An ownership document is required to list live" }, { status: 422 });
  }

  const baseSlug = slugify(`${title}-${locality}`);
  let slug = baseSlug;
  let counter = 2;
  while (await Property.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const property = await Property.create({
    ownerId: session.user.id,
    title,
    slug,
    locality,
    pinCode,
    zone: body.zone ? String(body.zone) : undefined,
    description: body.description ? String(body.description) : undefined,
    floor: body.floor ? String(body.floor) : undefined,
    type,
    price,
    areaSqft,
    bhk: body.bhk != null ? Number(body.bhk) : undefined,
    furnishing,
    ownershipDocUrl,
    images,
    amenities,
    status: "ACTIVE",
    viewCount: 0,
  });

  return NextResponse.json({ property: toPropertyView(property.toObject()) }, { status: 201 });
}
