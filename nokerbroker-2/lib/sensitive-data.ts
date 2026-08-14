import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer {
  const value = process.env.DATA_ENCRYPTION_KEY;
  if (!value) throw new Error("DATA_ENCRYPTION_KEY is required to store loan applications");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  return key;
}

/** Encrypt PII before persisting it. The application never returns this value to clients. */
export function encryptSensitive(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}
