"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListingSchema = void 0;
const zod_1 = require("zod");
exports.createListingSchema = zod_1.z.object({
    type: zod_1.z.enum(["FLAT", "VILLA", "PLOT", "COMMERCIAL"]),
    locality: zod_1.z.string().min(2),
    pinCode: zod_1.z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
    price: zod_1.z.coerce.number().positive(),
    areaSqft: zod_1.z.coerce.number().positive(),
    bhk: zod_1.z.coerce.number().int().min(1).max(10),
    description: zod_1.z.string().trim().min(10, "Description must be at least 10 characters").max(2000).optional(),
    amenities: zod_1.z
        .preprocess((value) => (typeof value === "string" ? [value] : value), zod_1.z.array(zod_1.z.string().trim().min(1).max(40)).max(20))
        .optional(),
});
