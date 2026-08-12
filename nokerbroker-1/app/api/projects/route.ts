import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { toProjectView } from "@/lib/serialize";
import { slugify } from "@/lib/slugify";

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
  const reraNumber = String(body.reraNumber ?? "").trim();
  const images = Array.isArray(body.images) ? body.images.map(String).filter(Boolean) : [];
  const amenities = Array.isArray(body.amenities) ? body.amenities.map(String).filter(Boolean) : [];
  const units = Array.isArray(body.units) ? body.units : [];

  if (!name || !locality || !pinCode) {
    return NextResponse.json({ error: "Name, locality and PIN code are required" }, { status: 422 });
  }
  if (!STATUSES.includes(constructionStatus)) {
    return NextResponse.json({ error: "Invalid construction status" }, { status: 422 });
  }
  if (!reraNumber) {
    return NextResponse.json({ error: "A RERA number is required to list a project live" }, { status: 422 });
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
    reraNumber,
    amenities,
    images,
    units,
    status: "LIVE",
  });

  const populated = await Project.findById(project._id)
    .populate("builderId", "name whatsappNumber whatsappVerified")
    .lean();

  return NextResponse.json({ project: toProjectView(populated) }, { status: 201 });
}
