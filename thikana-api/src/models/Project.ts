import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    builderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, maxlength: 120, required: true },
    locality: { type: String, required: true },
    pinCode: { type: String, required: true },
    address: String,
    description: { type: String, required: true },
    reraId: { type: String, required: true },
    images: [String],
    amenities: [String],
    possessionDate: Date,
    constructionStatus: {
      type: String,
      enum: ["UNDER_CONSTRUCTION", "READY_TO_MOVE", "COMPLETED"],
      default: "UNDER_CONSTRUCTION",
    },
    status: { type: String, enum: ["PENDING", "LIVE", "REJECTED", "PAUSED"], default: "PENDING" },
  },
  { timestamps: true }
);

projectSchema.index({ locality: 1, status: 1 });
projectSchema.index({ builderId: 1 });

export const Project = model("Project", projectSchema);
