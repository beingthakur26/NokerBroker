import { z } from "zod";

export const rejectSchema = z.object({
  reason: z.string().trim().min(3, "A reason is required for rejection").max(300),
});

export const verifyUserSchema = z.object({
  verified: z.boolean(),
});
