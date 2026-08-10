import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["LISTING", "PROJECT", "USER"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = model("AuditLog", auditLogSchema);
