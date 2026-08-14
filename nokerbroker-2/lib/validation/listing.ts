import { z } from "zod";

const url = z.url();

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  locality: z.string().trim().min(2).max(100),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must have 6 digits"),
  type: z.enum(["FLAT", "HOUSE", "PLOT", "VILLA", "OFFICE", "SHOP", "OTHER"]),
  furnishing: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"]),
  price: z.number().positive(),
  areaSqft: z.number().positive(),
  ownershipDocUrl: url,
  zone: z.string().trim().max(100).optional(),
  description: z.string().trim().max(4000).optional(),
  floor: z.string().trim().max(80).optional(),
  bhk: z.number().int().min(0).optional(),
  images: z.array(url).max(20).default([]),
  amenities: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(3).max(160),
  locality: z.string().trim().min(2).max(100),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must have 6 digits"),
  constructionStatus: z.enum(["PRE_LAUNCH", "UNDER_CONSTRUCTION", "READY_TO_MOVE"]),
  reraNumber: z.string().trim().min(5).max(60),
  zone: z.string().trim().max(100).optional(),
  description: z.string().trim().max(4000).optional(),
  progressPct: z.number().min(0).max(100).optional(),
  possessionDate: z.string().date().optional(),
  images: z.array(url).max(30).default([]),
  amenities: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
  units: z.array(z.object({ unitType: z.string().trim().min(1).max(40), priceFrom: z.number().positive(), priceTo: z.number().positive().optional(), areaSqft: z.number().positive(), floorPlanUrl: url.optional() })).min(1),
});

export const projectUnitCreateSchema = z.object({
  unitType: z.string().trim().min(1).max(40),
  priceFrom: z.coerce.number().positive(),
  priceTo: z.coerce.number().positive().optional(),
  areaSqft: z.coerce.number().positive(),
  floorPlanUrl: url.optional(),
}).refine((unit) => unit.priceTo === undefined || unit.priceTo >= unit.priceFrom, {
  message: "Price to must be at least the starting price",
  path: ["priceTo"],
});
