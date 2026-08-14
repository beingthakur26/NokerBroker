import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const inApp = body?.inApp !== false;
  const email = body?.email !== false;
  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, { notificationPreferences: { inApp, email } });
  return NextResponse.json({ ok: true, preferences: { inApp, email } });
}
