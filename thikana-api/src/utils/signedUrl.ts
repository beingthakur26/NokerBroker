import imagekit from "../config/imagekit";

export function getSignedUrl(filePath: string, expireSeconds = 3600): string {
  return imagekit.url({ path: filePath, signed: true, expireSeconds });
}
