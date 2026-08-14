import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Property from "@/models/Property";
import Project from "@/models/Project";
import { toInquiryView } from "@/lib/serialize";
import { getSentInquiries } from "@/lib/inquiries-db";
import User from "@/models/User";

const CONTACT_MODES = ["CALL", "WHATSAPP", "BOTH"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  }

  const sent = await getSentInquiries(session.user.id);
  return NextResponse.json({ inquiries: sent });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to send an enquiry" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const propertySlug = String(body.propertySlug ?? "").trim();
  const projectSlug = String(body.projectSlug ?? "").trim();
  const message = String(body.message ?? "").trim();
  const contactMode = String(body.contactMode ?? "WHATSAPP").toUpperCase();

  if (!propertySlug && !projectSlug) {
    return NextResponse.json({ error: "A property or project is required" }, { status: 422 });
  }
  if (!message) {
    return NextResponse.json({ error: "A short message is required" }, { status: 422 });
  }
  if (!CONTACT_MODES.includes(contactMode)) {
    return NextResponse.json({ error: "Invalid contact mode" }, { status: 422 });
  }

  await dbConnect();

  const sender = await User.findById(session.user.id, "whatsappNumber").lean();
  if (!sender?.whatsappNumber) {
    return NextResponse.json({ error: "Add your WhatsApp number in Profile before sending an enquiry" }, { status: 422 });
  }

  let propertyId: string | undefined;
  let projectId: string | undefined;
  if (propertySlug) {
    const property = await Property.findOne({ slug: propertySlug, status: "ACTIVE" }, "_id").lean();
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    propertyId = String(property._id);
  } else {
    const project = await Project.findOne({ slug: projectSlug, status: "LIVE" }, "_id").lean();
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    projectId = String(project._id);
  }

  const inquiry = await Inquiry.create({
    senderId: session.user.id,
    propertyId,
    projectId,
    message,
    contactMode,
    status: "OPEN",
  });

  const populated = await Inquiry.findById(inquiry._id)
    .populate("senderId", "name email whatsappNumber whatsappVerified")
    .populate("propertyId", "title slug")
    .populate("projectId", "name slug")
    .lean();

  return NextResponse.json({ inquiry: toInquiryView(populated) }, { status: 201 });
}
