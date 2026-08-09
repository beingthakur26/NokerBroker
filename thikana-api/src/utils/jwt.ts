import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
}