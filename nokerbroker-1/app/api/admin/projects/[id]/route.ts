import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { toProjectView } from "@/lib/serialize";

const STATUSES = ["LIVE", "PAUSED", "FLAGGED", "ARCHIVED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing project id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const status = String(body.status ?? "").toUpperCase();
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }

  await dbConnect();
  const project = await Project.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  )
    .populate("builderId", "name whatsappNumber whatsappVerified")
    .lean();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ project: toProjectView(project) });
}
