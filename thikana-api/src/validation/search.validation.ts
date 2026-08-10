import { z } from "zod";

export const searchListingsSchema = z.object({
  q: z.string().trim().min(1).optional(),
  locality: z.string().trim().min(1).optional(),
  type: z.enum(["FLAT", "VILLA", "PLOT", "COMMERCIAL"]).optional(),
  bhk: z.coerce.number().int().min(1).max(10).optional(),
  minBhk: z.coerce.number().int().min(1).max(10).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});
