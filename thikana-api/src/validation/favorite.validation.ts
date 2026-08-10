import { z } from "zod";

export const addFavoriteSchema = z.object({
  targetType: z.enum(["LISTING", "PROJECT"]),
  targetId: z.string().min(1),
});

export const createSavedSearchSchema = z.object({
  name: z.string().trim().min(2).max(80),
  filters: z
    .object({
      locality: z.string().trim().min(1).optional(),
      type: z.string().trim().min(1).optional(),
      bhk: z.coerce.number().int().min(1).max(10).optional(),
      minPrice: z.coerce.number().positive().optional(),
      maxPrice: z.coerce.number().positive().optional(),
    })
    .refine((f) => Object.values(f).some((v) => v !== undefined), {
      message: "Add at least one filter to save",
    }),
});

export const applyLoanSchema = z.object({
  listingId: z.string().optional(),
  propertyPrice: z.coerce.number().positive(),
  loanAmount: z.coerce.number().positive(),
  tenureYears: z.coerce.number().int().min(1).max(40),
  interestRate: z.coerce.number().positive().max(25),
  monthlyIncome: z.coerce.number().positive(),
  employmentType: z.enum(["SALARIED", "SELF_EMPLOYED", "BUSINESS"]),
});
