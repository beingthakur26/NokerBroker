import { NextResponse } from "next/server";
import { verifyWhatsappOtp } from "@/lib/whatsapp-otp";
import { isValidIndianNumber, normalizeIndianNumber, toMsg91Mobile } from "@/lib/phone";

export async function POST(req: Request) {
  let whatsappNumber: unknown;
  let otp: unknown;
  try {
    const body = await req.json();
    whatsappNumber = body?.whatsappNumber;
    otp = body?.otp;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    typeof whatsappNumber !== "string" ||
    typeof otp !== "string" ||
    !isValidIndianNumber(whatsappNumber) ||
    !/^\d{4,6}$/.test(otp)
  ) {
    return NextResponse.json(
      { error: "Invalid mobile number or code" },
      { status: 400 }
    );
  }

  const normalized = normalizeIndianNumber(whatsappNumber);

  try {
    const isValid = await verifyWhatsappOtp(toMsg91Mobile(normalized), otp);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect or expired code" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Could not verify the code right now. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, whatsappNumber: normalized });
}
