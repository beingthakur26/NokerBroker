import { Schema, model } from "mongoose";

const listingSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["FLAT", "VILLA", "PLOT", "COMMERCIAL"], required: true },
    locality: { type: String, required: true },
    pinCode: { type: String, required: true },
    price: { type: Number, required: true },
    areaSqft: { type: Number, required: true },
    bhk: { type: Number, required: true },
    images: [String], // public ImageKit URLs
    status: { type: String, enum: ["PENDING", "LIVE", "REJECTED", "PAUSED"], default: "PENDING" },
    ownershipDocPath: { type: String, select: false }, // ImageKit filePath — needs signing to view, excluded from every query by default
  },
  { timestamps: true }
);

listingSchema.index({ locality: 1, price: 1, bhk: 1 });

export const Listing = model("Listing", listingSchema);