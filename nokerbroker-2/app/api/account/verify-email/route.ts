import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashAccountToken } from "@/lib/account-tokens";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "Invalid verification link" }, { status: 400 });
  await dbConnect();
  const user = await User.findOneAndUpdate({ emailVerificationTokenHash: hashAccountToken(token), emailVerificationExpiresAt: { $gt: new Date() } }, { emailVerified: true, $unset: { emailVerificationTokenHash: 1, emailVerificationExpiresAt: 1 } }, { new: true });
  if (!user) return NextResponse.json({ error: "This verification link is invalid or expired" }, { status: 400 });
  await createNotification(String(user._id), "SECURITY_EVENT", "Your email address was verified.", "/dashboard/profile");
  return NextResponse.json({ ok: true });
}
