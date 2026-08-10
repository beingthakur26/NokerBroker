import { Schema, model } from "mongoose";

const favoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["LISTING", "PROJECT"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Favorite = model("Favorite", favoriteSchema);
