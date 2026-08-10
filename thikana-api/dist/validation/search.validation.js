"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchListingsSchema = void 0;
const zod_1 = require("zod");
exports.searchListingsSchema = zod_1.z.object({
    q: zod_1.z.string().trim().min(1).optional(),
    locality: zod_1.z.string().trim().min(1).optional(),
    type: zod_1.z.enum(["FLAT", "VILLA", "PLOT", "COMMERCIAL"]).optional(),
    bhk: zod_1.z.coerce.number().int().min(1).max(10).optional(),
    minBhk: zod_1.z.coerce.number().int().min(1).max(10).optional(),
    minPrice: zod_1.z.coerce.number().positive().optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    sort: zod_1.z.enum(["newest", "price_asc", "price_desc"]).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(48).default(24),
});
