// lib/imagekit.ts
import ImageKit from "imagekit";

let imagekit: ImageKit | null = null;

export function getImageKit(): ImageKit {
  if (!imagekit) {
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.IMAGEKIT_URL_ENDPOINT
    ) {
      throw new Error("ImageKit credentials are not set in .env.local");
    }
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekit;
}

export interface UploadedImage {
  url: string;
  fileId: string;
  filePath: string;
}

export async function uploadListingImage(
  file: Buffer,
  fileName: string
): Promise<UploadedImage> {
  const safeName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 120);
  const response = await getImageKit().upload({
    file,
    fileName: safeName || "listing.jpg",
    folder: "/listings",
    useUniqueFileName: true,
  });
  return {
    url: response.url,
    fileId: response.fileId,
    filePath: response.filePath,
  };
}
