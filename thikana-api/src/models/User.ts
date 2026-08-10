import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 80 },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["BUYER", "SELLER", "BUILDER", "ADMIN"], required: true },
    verified: { type: Boolean, default: false },
    companyName: { type: String, trim: true, maxlength: 120 },
    reraId: String,
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
