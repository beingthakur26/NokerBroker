import { NextResponse } from "next/server";
import { sendWhatsappOtp } from "@/lib/whatsapp-otp";
import {
  isValidIndianNumber,
  normalizeIndianNumber,
  toMsg91Mobile,
} from "@/lib/phone";

const COOLDOWN_MS = 30_000;

const globalWithOtp = globalThis as typeof globalThis & {
  otpLastSent?: Record<string, number>;
};

function cooldownRemaining(phone: string): number {
  const lastSent = globalWithOtp.otpLastSent ?? {};
  const elapsed = Date.now() - (lastSent[phone] ?? 0);
  return Math.max(0, COOLDOWN_MS - elapsed);
}

export async function POST(req: Request) {
  let whatsappNumber: unknown;
  try {
    const body = await req.json();
    whatsappNumber = body?.whatsappNumber;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (typeof whatsappNumber !== "string" || !isValidIndianNumber(whatsappNumber)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number" },
      { status: 400 }
    );
  }

  const normalized = normalizeIndianNumber(whatsappNumber);
  const remaining = cooldownRemaining(normalized);
  if (remaining > 0) {
    return NextResponse.json(
      { error: `Please wait ${Math.ceil(remaining / 1000)}s before requesting another code.` },
      { status: 429 }
    );
  }

  try {
    await sendWhatsappOtp(toMsg91Mobile(normalized));
    globalWithOtp.otpLastSent = {
      ...(globalWithOtp.otpLastSent ?? {}),
      [normalized]: Date.now(),
    };
    return NextResponse.json({ ok: true, resendIn: COOLDOWN_MS / 1000 });
  } catch {
    return NextResponse.json(
      { error: "Could not send the code. Please try again in a moment." },
      { status: 500 }
    );
  }
}
