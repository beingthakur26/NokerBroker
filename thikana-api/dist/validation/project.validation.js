"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInquirySchema = exports.updateProjectSchema = exports.createProjectSchema = exports.unitsArraySchema = exports.unitSchema = exports.unitTypeEnum = void 0;
const zod_1 = require("zod");
exports.unitTypeEnum = zod_1.z.enum(["STUDIO", "1BHK", "2BHK", "3BHK", "4BHK", "PENTHOUSE", "COMMERCIAL"]);
exports.unitSchema = zod_1.z.object({
    type: exports.unitTypeEnum,
    areaSqft: zod_1.z.coerce.number().positive(),
    price: zod_1.z.coerce.number().positive(),
    floor: zod_1.z.string().trim().max(30).optional(),
    availableUnits: zod_1.z.coerce.number().int().min(0).max(1000).optional(),
});
exports.unitsArraySchema = zod_1.z.array(exports.unitSchema).min(1, "Add at least one unit type");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(120),
    locality: zod_1.z.string().trim().min(2),
    pinCode: zod_1.z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
    address: zod_1.z.string().trim().max(300).optional(),
    description: zod_1.z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
    reraId: zod_1.z.string().trim().min(3).max(60),
    amenities: zod_1.z.array(zod_1.z.string().trim().min(1).max(40)).max(20).optional(),
    possessionDate: zod_1.z.coerce.date().optional(),
    constructionStatus: zod_1.z.enum(["UNDER_CONSTRUCTION", "READY_TO_MOVE", "COMPLETED"]).optional(),
});
exports.updateProjectSchema = exports.createProjectSchema.partial();
exports.createInquirySchema = zod_1.z.object({
    projectId: zod_1.z.string().optional(),
    listingId: zod_1.z.string().optional(),
    name: zod_1.z.string().trim().min(2).max(80),
    phone: zod_1.z.string().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
    message: zod_1.z.string().trim().max(1000).optional(),
    unitType: zod_1.z.string().trim().max(30).optional(),
});
