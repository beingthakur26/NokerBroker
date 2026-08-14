import crypto from "node:crypto";

export function createAccountToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, hash: crypto.createHash("sha256").update(token).digest("hex") };
}

export function hashAccountToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
