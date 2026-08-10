import { z } from "zod";

export const createListingSchema = z.object({
  type: z.enum(["FLAT", "VILLA", "PLOT", "COMMERCIAL"]),
  locality: z.string().min(2),
  pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
  price: z.coerce.number().positive(),
  areaSqft: z.coerce.number().positive(),
  bhk: z.coerce.number().int().min(1).max(10),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000).optional(),
  amenities: z
    .preprocess((value) => (typeof value === "string" ? [value] : value), z.array(z.string().trim().min(1).max(40)).max(20))
    .optional(),
});