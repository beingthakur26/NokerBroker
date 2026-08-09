import bcrypt from "bcryptjs";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOtp(code: string) {
  return bcrypt.hash(code, 10);
}

export async function compareOtp(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}