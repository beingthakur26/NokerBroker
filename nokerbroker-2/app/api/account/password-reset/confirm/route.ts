import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashAccountToken } from "@/lib/account-tokens";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!token || password.length < 10) return NextResponse.json({ error: "Use a password of at least 10 characters" }, { status: 422 });
  await dbConnect();
  const user = await User.findOneAndUpdate({ passwordResetTokenHash: hashAccountToken(token), passwordResetExpiresAt: { $gt: new Date() } }, { passwordHash: await bcrypt.hash(password, 12), $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }, { new: true });
  if (!user) return NextResponse.json({ error: "This reset link is invalid or expired" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
