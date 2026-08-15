import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(100).lean(),
    Notification.countDocuments({ userId: session.user.id, read: false }),
  ]);
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });
  return NextResponse.json({ ok: true });
}
