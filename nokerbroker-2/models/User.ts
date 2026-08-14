// models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name:              { type: String, required: true },
  email:             { type: String, required: true, unique: true },
  // Google accounts do not provide a WhatsApp number during OAuth. Keep this
  // optional until the user adds one, while preserving uniqueness when present.
  whatsappNumber:    { type: String, unique: true, sparse: true },
  passwordHash:      { type: String },
  whatsappVerified:  { type: Boolean, default: false },
  emailVerified:     { type: Boolean, default: false },
  emailVerificationTokenHash: { type: String },
  emailVerificationExpiresAt: { type: Date },
  passwordResetTokenHash: { type: String },
  passwordResetExpiresAt: { type: Date },
  avatarUrl:         { type: String },
  city:              { type: String },
  locality:          { type: String },
  notificationPreferences: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
  },
  role:              { type: String, enum: ["USER", "ADMIN"], default: "USER" },
}, { timestamps: true });

export default models.User || model("User", UserSchema);
