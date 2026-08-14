import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { createAccountToken } from "@/lib/account-tokens";
import { sendVerificationEmail } from "@/lib/email";
import { consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 10) return NextResponse.json({ error: "Enter a name, valid email, and password of at least 10 characters" }, { status: 422 });
  if (!(await consumeRateLimit(`register:${email}`, 5, 60 * 60_000))) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  await dbConnect();
  if (await User.exists({ email })) return NextResponse.json({ error: "An account already exists for this email" }, { status: 409 });
  const verification = createAccountToken();
  await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), emailVerified: false, emailVerificationTokenHash: verification.hash, emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60_000) });
  await sendVerificationEmail(email, verification.token);
  return NextResponse.json({ ok: true, message: "Account created. Check your email to verify it." }, { status: 201 });
}
