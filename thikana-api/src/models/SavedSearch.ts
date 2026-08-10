import { Schema, model } from "mongoose";

const savedSearchSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, maxlength: 80, required: true },
    filters: {
      type: {
        locality: String,
        type: String,
        bhk: Number,
        minPrice: Number,
        maxPrice: Number,
      },
      required: true,
    },
  },
  { timestamps: true }
);

savedSearchSchema.index({ userId: 1 });

export const SavedSearch = model("SavedSearch", savedSearchSchema);
