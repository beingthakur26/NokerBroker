import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadListingImage } from "@/lib/imagekit";
import { consumeRateLimit } from "@/lib/rate-limit";
import crypto from "node:crypto";
import dbConnect from "@/lib/mongodb";
import ImageAsset from "@/models/ImageAsset";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to upload images" }, { status: 401 });
  }
  if (!(await consumeRateLimit(`upload:${session.user.id}`, 30, 60 * 60_000))) {
    return NextResponse.json({ error: "Upload limit reached. Please try again later." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG or WebP images are allowed" },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image must be under 8 MB" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadListingImage(buffer, file.name);
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    await dbConnect();
    await ImageAsset.updateOne({ url: uploaded.url }, { $setOnInsert: { ...uploaded, sha256, uploadedBy: session.user.id } }, { upsert: true });
    return NextResponse.json({ ...uploaded, sha256 });
  } catch {
    return NextResponse.json(
      { error: "Could not upload the image. Please try again." },
      { status: 500 }
    );
  }
}
