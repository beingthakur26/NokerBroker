// app/api/projects/[id]/units/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { projectUnitCreateSchema } from "@/lib/validation/listing";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const validation = projectUnitCreateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Invalid unit fields" }, { status: 422 });
  }
  const { unitType, priceFrom, priceTo, areaSqft, floorPlanUrl } = validation.data;

  await dbConnect();
  const project = await Project.findOne({ _id: id, builderId: session.user.id });
  if (!project) {
    return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
  }

  project.units.push({
    unitType,
    priceFrom,
    priceTo: priceTo ?? priceFrom,
    areaSqft,
    floorPlanUrl,
  });

  await project.save();
  return NextResponse.json({ ok: true, project });
}
