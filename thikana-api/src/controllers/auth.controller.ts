import { Request, Response } from "express";
import { Otp } from "../models/Otp";
import { User } from "../models/User";
import { generateOtp, hashOtp, compareOtp } from "../utils/otp";
import { signToken } from "../utils/jwt";
import { loginOtpSchema, requestOtpSchema, signupOtpSchema, updateProfileSchema } from "../validation/auth.validation";
import { AuthedRequest } from "../middleware/auth.middleware";

export async function requestOtp(req: Request, res: Response) {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phone } = parsed.data;

  const code = generateOtp();
  const codeHash = await hashOtp(code);

  await Otp.findOneAndDelete({ phone }); // clear any earlier unused OTP for this number
  await Otp.create({
    phone,
    codeHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  // DEV ONLY — replace this with an MSG91/Twilio SMS call before going to production.
  // In production, send the OTP through an SMS provider instead of logging it.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
  }

  res.json({ message: "OTP sent" });
}

async function consumeOtp(phone: string, code: string, res: Response) {
  const otpRecord = await Otp.findOne({ phone });
  if (!otpRecord) {
    res.status(400).json({ error: "OTP expired or not requested. Request a new one." });
    return false;
  }

  if (otpRecord.expiresAt <= new Date()) {
    await Otp.deleteOne({ _id: otpRecord._id });
    res.status(400).json({ error: "OTP expired. Request a new one." });
    return false;
  }

  const isValid = await compareOtp(code, otpRecord.codeHash);
  if (!isValid) {
    res.status(400).json({ error: "Incorrect code." });
    return false;
  }

  await Otp.deleteOne({ _id: otpRecord._id });
  return true;
}

function setSession(res: Response, user: { _id: { toString(): string }; role: string }) {
  const token = signToken({ userId: user._id.toString(), role: user.role });
  res.cookie("thikana_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function publicUser(user: { _id: unknown; name?: string | null; email?: string | null; phone: string; role: string; verified: boolean }) {
  return {
    id: String(user._id),
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone,
    role: user.role,
    verified: user.verified,
  };
}

export async function verifySignupOtp(req: Request, res: Response) {
  const parsed = signupOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phone, code, role } = parsed.data;

  if (!(await consumeOtp(phone, code, res))) return;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(409).json({ error: "An account already exists for this number. Please log in." });
  }

  const user = await User.create({ phone, role, verified: false });
  setSession(res, user);
  res.status(201).json({ user: publicUser(user) });
}

export async function verifyLoginOtp(req: Request, res: Response) {
  const parsed = loginOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phone, code } = parsed.data;

  if (!(await consumeOtp(phone, code, res))) return;

  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(404).json({ error: "No account found for this number. Please sign up." });
  }

  setSession(res, user);
  res.json({ user: publicUser(user) });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.user!.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
}

export async function updateProfile(req: AuthedRequest, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  if (parsed.data.email) {
    const emailOwner = await User.findOne({ email: parsed.data.email, _id: { $ne: req.user!.userId } });
    if (emailOwner) return res.status(409).json({ error: "This email address is already in use" });
  }

  const user = await User.findByIdAndUpdate(req.user!.userId, parsed.data, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("thikana_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(204).end();
}
