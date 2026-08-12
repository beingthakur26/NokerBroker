import { Schema, model, models } from "mongoose";

const FavoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

FavoriteSchema.index(
  { userId: 1, propertyId: 1, projectId: 1 },
  { unique: true }
);

export default models.Favorite || model("Favorite", FavoriteSchema);

export type FavoriteTarget = { propertyId?: string; projectId?: string };
