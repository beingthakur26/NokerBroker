import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["BUYER", "SELLER", "BUILDER", "ADMIN"], required: true },
    verified: { type: Boolean, default: false },
    reraId: String,
  },
  { timestamps: true }
);

export const User = model("User", userSchema);