// app/api/projects/[id]/units/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { unitType, priceFrom, priceTo, areaSqft, floorPlanUrl } = await req.json();

  if (!unitType || !priceFrom || !areaSqft) {
    return NextResponse.json({ error: "Missing required unit fields" }, { status: 400 });
  }
  if (floorPlanUrl && (typeof floorPlanUrl !== "string" || !/^https:\/\//.test(floorPlanUrl))) {
    return NextResponse.json({ error: "Floor plan URL must be a secure URL" }, { status: 422 });
  }

  await dbConnect();
  const project = await Project.findOne({ _id: id, builderId: session.user.id });
  if (!project) {
    return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
  }

  project.units.push({
    unitType,
    priceFrom: Number(priceFrom),
    priceTo: priceTo ? Number(priceTo) : Number(priceFrom),
    areaSqft: Number(areaSqft),
    floorPlanUrl,
  });

  await project.save();
  return NextResponse.json({ ok: true, project });
}
