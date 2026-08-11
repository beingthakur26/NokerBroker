import { NextResponse } from "next/server";
import { verifyWhatsappOtp } from "@/lib/whatsapp-otp";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const { whatsappNumber, otp } = await req.json();

  const isValid = await verifyWhatsappOtp(whatsappNumber, otp);

  if (!isValid) {
    return NextResponse.json(
      { error: "Incorrect or expired code" },
      { status: 401 }
    );
  }

  await dbConnect();

  let user = await User.findOne({ whatsappNumber });

  if (!user) {
    user = await User.create({
      whatsappNumber,
      whatsappVerified: true,
      name: "New User",
      email: `${whatsappNumber}@placeholder.nokerbroker.in`,
    });
  } else if (!user.whatsappVerified) {
    user.whatsappVerified = true;
    await user.save();
  }

  return NextResponse.json({
    ok: true,
    userId: user._id.toString(),
  });
}