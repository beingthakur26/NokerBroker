import { Schema, model } from "mongoose";

const unitSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    type: {
      type: String,
      enum: ["STUDIO", "1BHK", "2BHK", "3BHK", "4BHK", "PENTHOUSE", "COMMERCIAL"],
      required: true,
    },
    areaSqft: { type: Number, required: true },
    price: { type: Number, required: true },
    floor: String,
    availableUnits: { type: Number, min: 0, default: 1 },
  },
  { timestamps: true }
);

unitSchema.index({ projectId: 1 });

export const Unit = model("Unit", unitSchema);
