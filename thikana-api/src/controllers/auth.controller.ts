import { Request, Response } from "express";
import { Otp } from "../models/Otp";
import { User } from "../models/User";
import { generateOtp, hashOtp, compareOtp } from "../utils/otp";
import { signToken } from "../utils/jwt";
import { requestOtpSchema, verifyOtpSchema } from "../validation/auth.validation";

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
  console.log(`[DEV] OTP for ${phone}: ${code}`);

  res.json({ message: "OTP sent" });
}

export async function verifyOtp(req: Request, res: Response) {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phone, code, role } = parsed.data;

  const otpRecord = await Otp.findOne({ phone });
  if (!otpRecord) {
    return res.status(400).json({ error: "OTP expired or not requested. Request a new one." });
  }

  const isValid = await compareOtp(code, otpRecord.codeHash);
  if (!isValid) {
    return res.status(400).json({ error: "Incorrect code." });
  }

  await Otp.deleteOne({ _id: otpRecord._id }); // one-time use, delete immediately after success

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, role, verified: false });
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  res.cookie("thikana_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: { id: user._id, phone: user.phone, role: user.role, verified: user.verified },
  });
}