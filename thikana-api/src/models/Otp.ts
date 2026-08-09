import { Schema, model } from "mongoose";

const otpSchema = new Schema({
  phone: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// TTL index — MongoDB deletes the document itself once expiresAt passes, no cleanup job needed
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = model("Otp", otpSchema);