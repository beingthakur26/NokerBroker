import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import BuilderProfile from "@/models/BuilderProfile";

const RERA_PATTERN = /^[A-Z]\d{11}$/i;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Log in to continue" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const companyName = String(body.companyName ?? "").trim().slice(0, 120);
  const reraNumber = String(body.reraNumber ?? "").trim().toUpperCase();
  const documentUrls = Array.isArray(body.documentUrls) ? body.documentUrls.map(String).filter(Boolean).slice(0, 10) : [];
  if (!companyName || !RERA_PATTERN.test(reraNumber) || documentUrls.length === 0) {
    return NextResponse.json({ error: "Company name, a valid MahaRERA number, and at least one document are required" }, { status: 422 });
  }

  await dbConnect();
  const existing = await BuilderProfile.findOne({ userId: session.user.id }).lean();
  if (existing?.status === "VERIFIED") {
    return NextResponse.json({ error: "Your builder profile is already approved" }, { status: 409 });
  }

  try {
    const profile = await BuilderProfile.findOneAndUpdate(
      { userId: session.user.id },
      { companyName, reraNumber, documentUrls, status: "PENDING", verifiedAt: undefined },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return NextResponse.json({ profile }, { status: existing ? 200 : 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "That RERA number is already registered" }, { status: 409 });
    }
    throw error;
  }
}
