// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const bookings = await Booking.find({ userId: session.user.id })
    .populate("projectId", "name locality")
    .sort({ createdAt: -1 });

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, unitId, tokenAmount, paymentRef } = await req.json();

  if (!projectId || !unitId) {
    return NextResponse.json({ error: "Missing projectId or unitId" }, { status: 400 });
  }

  await dbConnect();
  const booking = await Booking.create({
    userId: session.user.id,
    projectId,
    unitId,
    tokenAmount: tokenAmount ? Number(tokenAmount) : undefined,
    paymentRef,
    status: tokenAmount ? "TOKEN_PAID" : "ENQUIRED",
  });

  return NextResponse.json({ ok: true, booking });
}
