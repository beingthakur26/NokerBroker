// models/SavedSearch.ts
import { Schema, model, models, Types } from "mongoose";

const SavedSearchSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    filters: { type: Schema.Types.Mixed, required: true },
    alertsOn: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SavedSearchSchema.index({ userId: 1, createdAt: -1 });

export default models.SavedSearch || model("SavedSearch", SavedSearchSchema);
