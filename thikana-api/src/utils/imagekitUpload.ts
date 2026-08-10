import imagekit from "../config/imagekit";

interface UploadResult {
  url: string;
  filePath: string;
  fileId: string;
}

export async function uploadBuffer(
  buffer: Buffer,
  fileName: string,
  folder: string,
  isPrivate = false
): Promise<UploadResult> {
  const result = await imagekit.upload({
    file: buffer, // ImageKit accepts a raw Buffer directly
    fileName,
    folder,
    isPrivateFile: isPrivate, // true = not reachable by a plain URL, needs a signed URL to view
    useUniqueFileName: true,
  });

  return { url: result.url, filePath: result.filePath, fileId: result.fileId };
}