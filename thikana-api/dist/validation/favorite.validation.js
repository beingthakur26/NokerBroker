"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyLoanSchema = exports.createSavedSearchSchema = exports.addFavoriteSchema = void 0;
const zod_1 = require("zod");
exports.addFavoriteSchema = zod_1.z.object({
    targetType: zod_1.z.enum(["LISTING", "PROJECT"]),
    targetId: zod_1.z.string().min(1),
});
exports.createSavedSearchSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(80),
    filters: zod_1.z
        .object({
        locality: zod_1.z.string().trim().min(1).optional(),
        type: zod_1.z.string().trim().min(1).optional(),
        bhk: zod_1.z.coerce.number().int().min(1).max(10).optional(),
        minPrice: zod_1.z.coerce.number().positive().optional(),
        maxPrice: zod_1.z.coerce.number().positive().optional(),
    })
        .refine((f) => Object.values(f).some((v) => v !== undefined), {
        message: "Add at least one filter to save",
    }),
});
exports.applyLoanSchema = zod_1.z.object({
    listingId: zod_1.z.string().optional(),
    propertyPrice: zod_1.z.coerce.number().positive(),
    loanAmount: zod_1.z.coerce.number().positive(),
    tenureYears: zod_1.z.coerce.number().int().min(1).max(40),
    interestRate: zod_1.z.coerce.number().positive().max(25),
    monthlyIncome: zod_1.z.coerce.number().positive(),
    employmentType: zod_1.z.enum(["SALARIED", "SELF_EMPLOYED", "BUSINESS"]),
});
