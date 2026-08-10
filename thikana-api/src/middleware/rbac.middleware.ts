import { Response, NextFunction } from "express";
import { AuthedRequest } from "./auth.middleware";
import { User } from "../models/User";

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have permission to do that" });
    }
    next();
  };
}

export async function requireVerifiedBuilder(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  const user = await User.findById(req.user.userId).select("role verified");
  if (!user || user.role !== "BUILDER" || !user.verified) {
    return res
      .status(403)
      .json({ error: "Your builder account needs admin verification before you can create projects" });
  }
  next();
}
