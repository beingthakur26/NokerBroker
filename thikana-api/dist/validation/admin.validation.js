"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserSchema = exports.rejectSchema = void 0;
const zod_1 = require("zod");
exports.rejectSchema = zod_1.z.object({
    reason: zod_1.z.string().trim().min(3, "A reason is required for rejection").max(300),
});
exports.verifyUserSchema = zod_1.z.object({
    verified: zod_1.z.boolean(),
});
