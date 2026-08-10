import { z } from "zod";

export const unitTypeEnum = z.enum(["STUDIO", "1BHK", "2BHK", "3BHK", "4BHK", "PENTHOUSE", "COMMERCIAL"]);

export const unitSchema = z.object({
  type: unitTypeEnum,
  areaSqft: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  floor: z.string().trim().max(30).optional(),
  availableUnits: z.coerce.number().int().min(0).max(1000).optional(),
});

export const unitsArraySchema = z.array(unitSchema).min(1, "Add at least one unit type");

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  locality: z.string().trim().min(2),
  pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
  address: z.string().trim().max(300).optional(),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
  reraId: z.string().trim().min(3).max(60),
  amenities: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  possessionDate: z.coerce.date().optional(),
  constructionStatus: z.enum(["UNDER_CONSTRUCTION", "READY_TO_MOVE", "COMPLETED"]).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createInquirySchema = z.object({
  projectId: z.string().optional(),
  listingId: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  message: z.string().trim().max(1000).optional(),
  unitType: z.string().trim().max(30).optional(),
});
