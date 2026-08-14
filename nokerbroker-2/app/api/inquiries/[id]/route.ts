import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Property from "@/models/Property";
import Project from "@/models/Project";
import { createNotification } from "@/lib/notifications";

const STATUSES = ["OPEN", "RESPONDED", "CLOSED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing inquiry id" }, { status: 400 });

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
  const inquiry = await Inquiry.findById(id);
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });

  const admin = await isAdminSession();
  let recipientId = "";
  if (inquiry.recipientId) {
    recipientId = String(inquiry.recipientId);
  } else if (inquiry.propertyId) {
    const property = await Property.findById(inquiry.propertyId, "ownerId").lean();
    recipientId = property?.ownerId ? String(property.ownerId) : "";
  } else if (inquiry.projectId) {
    const project = await Project.findById(inquiry.projectId, "builderId").lean();
    recipientId = project?.builderId ? String(project.builderId) : "";
  }
  if (!admin && recipientId !== session.user.id) {
    return NextResponse.json({ error: "Only the listing owner, builder, or an administrator can update an inquiry" }, { status: 403 });
  }

  const previousStatus = inquiry.status;
  inquiry.status = status;
  await inquiry.save();
  if (status === "CLOSED" && previousStatus !== "CLOSED" && String(inquiry.senderId) !== session.user.id) {
    await createNotification(String(inquiry.senderId), "INQUIRY_CLOSED", "An owner closed your inquiry.", "/dashboard/inquiries/sent");
  }
  return NextResponse.json({ ok: true, status });
}
