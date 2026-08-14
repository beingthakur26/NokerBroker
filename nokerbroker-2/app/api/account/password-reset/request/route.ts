import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { createAccountToken } from "@/lib/account-tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!(await consumeRateLimit(`password-reset:${email || "invalid"}`, 3, 60 * 60_000))) return NextResponse.json({ ok: true, message: "If that account exists, a reset link has been sent." });
  // Deliberately return the same response for unknown accounts to avoid account enumeration.
  if (/^\S+@\S+\.\S+$/.test(email)) {
    await dbConnect();
    const user = await User.findOne({ email });
    if (user?.passwordHash) {
      const reset = createAccountToken();
      user.passwordResetTokenHash = reset.hash;
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60_000);
      await user.save();
      await sendPasswordResetEmail(email, reset.token);
    }
  }
  return NextResponse.json({ ok: true, message: "If that account exists, a reset link has been sent." });
}
