import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { toPropertyView } from "@/lib/serialize";
import { slugify } from "@/lib/slugify";
import { matchesBudget } from "@/lib/properties";
import { propertyCreateSchema } from "@/lib/validation/listing";
import User from "@/models/User";
import { createNotification } from "@/lib/notifications";
import { consumeRateLimit } from "@/lib/rate-limit";
import { escapeRegex } from "@/lib/search";
import ImageAsset from "@/models/ImageAsset";
import { geocodeLocality } from "@/lib/mapbox";
import { deliverSavedSearchMatches } from "@/lib/saved-search-delivery";

const TYPES = ["FLAT", "HOUSE", "PLOT", "VILLA", "OFFICE", "SHOP", "OTHER"];
const FURNISHING = ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"];

export async function GET(request: Request) {
  await dbConnect();
  const url = new URL(request.url);
  const locality = url.searchParams.get("locality")?.toLowerCase() ?? "";
  const budget = url.searchParams.get("budget") ?? "";
  const bhk = url.searchParams.get("bhk") ?? "";
  const type = url.searchParams.get("type") ?? "";
  // This is a public endpoint. Never allow a query parameter to expose
  // draft, sold, archived, or moderator-flagged listings.
  const query: Record<string, unknown> = { status: "ACTIVE" };
  if (locality) query.locality = new RegExp(escapeRegex(locality), "i");
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
  await dbConnect();
  const user = await User.findById(session.user.id, "whatsappVerified").lean();
  if (!user?.whatsappVerified) {
    return NextResponse.json(
      { error: "Verify your WhatsApp number before publishing a listing" },
      { status: 403 }
    );
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

  const validation = propertyCreateSchema.safeParse({
    title, locality, pinCode, type, furnishing, price, areaSqft, ownershipDocUrl,
    zone: body.zone ? String(body.zone) : undefined,
    description: body.description ? String(body.description) : undefined,
    floor: body.floor ? String(body.floor) : undefined,
    bhk: body.bhk != null ? Number(body.bhk) : undefined,
    images, amenities,
  });
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Invalid listing fields" }, { status: 422 });
  }

  const baseSlug = slugify(`${title}-${locality}`);
  let slug = baseSlug;
  let counter = 2;
  while (await Property.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  if (!(await consumeRateLimit(`property-create:${session.user.id}`, 5, 60 * 60_000))) {
    return NextResponse.json({ error: "You can publish up to five listings per hour. Please try again later." }, { status: 429 });
  }

  const imageAssets = images.length ? await ImageAsset.find({ url: { $in: images } }, "sha256").lean() : [];
  const imageHashes = [...new Set(imageAssets.map((asset) => asset.sha256))];
  const duplicateCandidates = imageHashes.length
    ? await Property.find({ imageHashes: { $in: imageHashes } }, "_id title").limit(10).lean()
    : [];
  const coordinates = await geocodeLocality(locality, pinCode);
  const duplicateReview = duplicateCandidates.length ? {
    flagged: true,
    reason: `Exact image hash matches ${duplicateCandidates.length} existing listing${duplicateCandidates.length === 1 ? "" : "s"}.`,
    matchedPropertyIds: duplicateCandidates.map((candidate) => candidate._id),
  } : undefined;

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
    imageHashes,
    duplicateReview,
    location: coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : undefined,
    amenities,
    status: "ACTIVE",
    viewCount: 0,
  });

  await createNotification(session.user.id, "LISTING_LIVE", `Your listing, ${property.title}, is now live.`, `/dashboard/listings/${property._id}/edit`);

  await deliverSavedSearchMatches([property.toObject()]);

  return NextResponse.json({ property: toPropertyView(property.toObject()) }, { status: 201 });
}
