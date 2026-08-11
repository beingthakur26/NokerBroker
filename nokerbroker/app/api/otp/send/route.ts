import { NextResponse } from "next/server";
import { sendWhatsappOtp } from "@/lib/whatsapp-otp";

export async function POST(req: Request) {
  const { whatsappNumber } = await req.json();

  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    return NextResponse.json(
      { error: "Invalid WhatsApp number" },
      { status: 400 }
    );
  }

  try {
    await sendWhatsappOtp(whatsappNumber);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not send OTP" },
      { status: 500 }
    );
  }
}