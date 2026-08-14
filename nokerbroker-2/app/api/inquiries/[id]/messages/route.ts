import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import InquiryMessage from "@/models/InquiryMessage";
import User from "@/models/User";
import Property from "@/models/Property";
import Project from "@/models/Project";
import { createNotification } from "@/lib/notifications";

async function accessibleInquiry(id: string, userId: string, admin: boolean) {
  const inquiry = await Inquiry.findById(id).lean();
  if (!inquiry) return null;
  let recipientId = inquiry.recipientId ? String(inquiry.recipientId) : "";
  // Listings created before recipientId was introduced remain readable.
  if (!recipientId && inquiry.propertyId) recipientId = String((await Property.findById(inquiry.propertyId, "ownerId").lean())?.ownerId ?? "");
  if (!recipientId && inquiry.projectId) recipientId = String((await Project.findById(inquiry.projectId, "builderId").lean())?.builderId ?? "");
  if (!admin && String(inquiry.senderId) !== userId && recipientId !== userId) return null;
  if (!inquiry.recipientId && recipientId) await Inquiry.findByIdAndUpdate(id, { recipientId });
  return inquiry;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  const { id } = await params;
  await dbConnect();
  const inquiry = await accessibleInquiry(id, session.user.id, await isAdminSession());
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  const messages = await InquiryMessage.find({ inquiryId: id }).populate("senderId", "name").sort({ createdAt: 1 }).lean();
  await InquiryMessage.updateMany({ inquiryId: id, senderId: { $ne: session.user.id }, readAt: { $exists: false } }, { readAt: new Date() });
  return NextResponse.json({ messages: messages.map((message) => ({ id: String(message._id), body: message.body, createdAt: message.createdAt, senderId: String(message.senderId?._id ?? message.senderId), senderName: message.senderId?.name ?? "User" })) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Log in to continue" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 2_000) return NextResponse.json({ error: "Enter a message between 1 and 2,000 characters" }, { status: 422 });
  const { id } = await params;
  await dbConnect();
  const admin = await isAdminSession();
  const inquiry = await accessibleInquiry(id, session.user.id, admin);
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  const created = await InquiryMessage.create({ inquiryId: id, senderId: session.user.id, body: message });
  if (!admin) {
    await Inquiry.findByIdAndUpdate(id, { status: "RESPONDED" });
    const otherUser = String(inquiry.senderId) === session.user.id ? String(inquiry.recipientId) : String(inquiry.senderId);
    await createNotification(otherUser, "NEW_INQUIRY", "You have a new reply to an inquiry.");
  }
  const sender = await User.findById(session.user.id, "name").lean();
  return NextResponse.json({ message: { id: String(created._id), body: created.body, createdAt: created.createdAt, senderId: session.user.id, senderName: sender?.name ?? "User" } }, { status: 201 });
}
