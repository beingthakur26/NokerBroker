// models/BuilderProfile.ts
import { Schema, model, models, Types } from "mongoose";

const BuilderProfileSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    reraNumber: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ["VERIFIED", "FLAGGED", "REJECTED"],
      default: "VERIFIED",
    },
    documentUrls: [{ type: String }],
    verifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.BuilderProfile || model("BuilderProfile", BuilderProfileSchema);
