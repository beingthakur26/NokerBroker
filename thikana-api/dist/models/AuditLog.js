"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = require("mongoose");
const auditLogSchema = new mongoose_1.Schema({
    adminId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["LISTING", "PROJECT", "USER"], required: true },
    targetId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    reason: String,
}, { timestamps: true });
auditLogSchema.index({ targetType: 1, targetId: 1 });
exports.AuditLog = (0, mongoose_1.model)("AuditLog", auditLogSchema);
