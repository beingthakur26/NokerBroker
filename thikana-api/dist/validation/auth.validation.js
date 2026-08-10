"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.loginOtpSchema = exports.signupOtpSchema = exports.requestOtpSchema = void 0;
const zod_1 = require("zod");
exports.requestOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number, e.g. +919812345678"),
});
const otpVerificationFields = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\+91[6-9]\d{9}$/),
    code: zod_1.z.string().length(6),
});
exports.signupOtpSchema = otpVerificationFields
    .extend({
    role: zod_1.z.enum(["BUYER", "SELLER", "BUILDER"]),
    companyName: zod_1.z.string().trim().min(2).max(120).optional(),
    reraId: zod_1.z.string().trim().min(3).max(60).optional(),
})
    .superRefine((data, ctx) => {
    if (data.role === "BUILDER") {
        if (!data.companyName || data.companyName.length < 2) {
            ctx.addIssue({ code: "custom", message: "Company name is required for builder accounts" });
        }
        if (!data.reraId || data.reraId.length < 3) {
            ctx.addIssue({ code: "custom", message: "RERA ID is required for builder accounts" });
        }
    }
});
exports.loginOtpSchema = otpVerificationFields;
exports.updateProfileSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
    email: zod_1.z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
})
    .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "Provide a name or email to update",
});
