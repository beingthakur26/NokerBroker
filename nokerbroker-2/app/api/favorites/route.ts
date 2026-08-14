import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import Property from "@/models/Property";
import Project from "@/models/Project";
import { toPropertyView, toProjectView } from "@/lib/serialize";

async function resolveTarget(
  slug: string,
  kind: "property" | "project"
): Promise<{ propertyId?: string; projectId?: string } | null> {
  await dbConnect();
  if (kind === "project") {
    const project = await Project.findOne({ slug, status: "LIVE" }, "_id").lean();
    return project ? { projectId: String(project._id) } : null;
  }
  const property = await Property.findOne({ slug, status: "ACTIVE" }, "_id").lean();
  return property ? { propertyId: String(property._id) } : null;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const kind = url.searchParams.get("kind") === "project" ? "project" : "property";

  if (slug) {
    const target = await resolveTarget(slug, kind);
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await dbConnect();
    const existing = await Favorite.findOne({ userId: session.user.id, ...target }).lean();
    return NextResponse.json({ saved: Boolean(existing) });
  }

  await dbConnect();
  const favorites = await Favorite.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const propertyIds = favorites
    .map((favorite) => favorite.propertyId)
    .filter(Boolean)
    .map(String);
  const projectIds = favorites
    .map((favorite) => favorite.projectId)
    .filter(Boolean)
    .map(String);

  const [properties, projects] = await Promise.all([
    propertyIds.length
      ? Property.find({ _id: { $in: propertyIds } })
          .populate("ownerId", "name whatsappNumber whatsappVerified")
          .lean()
      : [],
    projectIds.length
      ? Project.find({ _id: { $in: projectIds } })
          .populate("builderId", "name whatsappNumber whatsappVerified")
          .lean()
      : [],
  ]);

  return NextResponse.json({
    properties: properties.map(toPropertyView),
    projects: projects.map(toProjectView),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to save" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  const kind = body.kind === "project" ? "project" : "property";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 422 });

  const target = await resolveTarget(slug, kind);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await dbConnect();
  const existing = await Favorite.findOne({ userId: session.user.id, ...target }).lean();
  if (existing) {
    await Favorite.deleteOne({ _id: existing._id });
    return NextResponse.json({ saved: false });
  }

  await Favorite.create({ userId: session.user.id, ...target });
  return NextResponse.json({ saved: true });
}
