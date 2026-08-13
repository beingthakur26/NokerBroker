import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const month = typeof body.month === "string" ? new Date(body.month) : null;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1_000) : "";
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((url): url is string => typeof url === "string" && /^https:\/\//.test(url)).slice(0, 12)
    : [];
  if (!month || Number.isNaN(month.valueOf()) || (!note && imageUrls.length === 0)) {
    return NextResponse.json({ error: "Add a valid month and a note or at least one photo" }, { status: 422 });
  }

  const { id } = await params;
  await dbConnect();
  const project = await Project.findOne({ _id: id, builderId: session.user.id });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  project.updates.push({ month, note: note || undefined, imageUrls });
  await project.save();
  return NextResponse.json({ ok: true });
}
