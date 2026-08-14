import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import BuilderProfile from "@/models/BuilderProfile";
import User from "@/models/User";
import { toProjectView } from "@/lib/serialize";
import { slugify } from "@/lib/slugify";
import { projectCreateSchema } from "@/lib/validation/listing";
import { createNotification } from "@/lib/notifications";

const STATUSES = ["PRE_LAUNCH", "UNDER_CONSTRUCTION", "READY_TO_MOVE"];

export async function GET() {
  await dbConnect();
  const docs = await Project.find({ status: "LIVE" })
    .populate("builderId", "name whatsappNumber whatsappVerified")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ projects: docs.map(toProjectView) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to list a project" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const locality = String(body.locality ?? "").trim();
  const pinCode = String(body.pinCode ?? "").trim();
  const constructionStatus = String(body.constructionStatus ?? "UNDER_CONSTRUCTION").toUpperCase();
  const images = Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [];
  const amenities = Array.isArray(body.amenities) ? body.amenities.map(String).filter(Boolean) : [];
  const units = Array.isArray(body.units) ? body.units : [];

  if (!name || !locality || !pinCode) {
    return NextResponse.json({ error: "Name, locality and PIN code are required" }, { status: 422 });
  }
  if (!STATUSES.includes(constructionStatus)) {
    return NextResponse.json({ error: "Invalid construction status" }, { status: 422 });
  }
  await dbConnect();
  const user = await User.findById(session.user.id, "whatsappVerified").lean();
  if (!user?.whatsappVerified) {
    return NextResponse.json(
      { error: "Verify your WhatsApp number before publishing a project" },
      { status: 403 }
    );
  }
  const builderProfile = await BuilderProfile.findOne({ userId: session.user.id }).lean();
  if (!builderProfile || builderProfile.status !== "VERIFIED") {
    return NextResponse.json({ error: "Your builder verification must be approved by an admin before you can list a project" }, { status: 403 });
  }

  const normalizedUnits = units.map((unit) => ({
    unitType: String(unit?.unitType ?? "").trim(),
    priceFrom: Number(unit?.priceFrom),
    priceTo: unit?.priceTo != null ? Number(unit.priceTo) : undefined,
    areaSqft: Number(unit?.areaSqft),
    floorPlanUrl: unit?.floorPlanUrl ? String(unit.floorPlanUrl) : undefined,
  }));
  const validation = projectCreateSchema.safeParse({
    name, locality, pinCode, constructionStatus, reraNumber: builderProfile.reraNumber, images, amenities,
    zone: body.zone ? String(body.zone) : undefined,
    description: body.description ? String(body.description) : undefined,
    progressPct: body.progressPct != null ? Number(body.progressPct) : undefined,
    possessionDate: body.possessionDate ? String(body.possessionDate) : undefined,
    units: normalizedUnits,
  });
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Invalid project fields" }, { status: 422 });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;
  while (await Project.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const project = await Project.create({
    builderId: session.user.id,
    name,
    slug,
    locality,
    pinCode,
    zone: body.zone ? String(body.zone) : undefined,
    description: body.description ? String(body.description) : undefined,
    constructionStatus,
    progressPct: body.progressPct != null ? Number(body.progressPct) : 0,
    possessionDate: body.possessionDate ? new Date(String(body.possessionDate)) : undefined,
    reraNumber: builderProfile.reraNumber,
    amenities,
    images,
    units: normalizedUnits,
    status: "LIVE",
  });
  await createNotification(session.user.id, "LISTING_LIVE", `Your project, ${project.name}, is now live.`, "/dashboard/projects");

  const populated = await Project.findById(project._id)
    .populate("builderId", "name whatsappNumber whatsappVerified")
    .lean();

  return NextResponse.json({ project: toProjectView(populated) }, { status: 201 });
}
