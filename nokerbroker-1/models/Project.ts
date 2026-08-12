import { Schema, model, models } from "mongoose";

const ProjectUnitSchema = new Schema(
  {
    unitType: { type: String, required: true },
    priceFrom: { type: Number, required: true, min: 0 },
    priceTo: { type: Number, min: 0 },
    areaSqft: { type: Number, required: true, min: 0 },
    floorPlanUrl: { type: String },
  },
  { _id: true }
);

const ProjectUpdateSchema = new Schema(
  {
    month: { type: Date, required: true },
    imageUrls: { type: [String], default: [] },
    note: { type: String },
  },
  { _id: true }
);

const ProjectSchema = new Schema(
  {
    builderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    locality: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    zone: { type: String, trim: true },
    description: { type: String, trim: true },
    constructionStatus: {
      type: String,
      enum: ["PRE_LAUNCH", "UNDER_CONSTRUCTION", "READY_TO_MOVE"],
      default: "UNDER_CONSTRUCTION",
    },
    progressPct: { type: Number, default: 0, min: 0, max: 100 },
    possessionDate: { type: Date },
    reraNumber: { type: String, trim: true },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    brochureUrl: { type: String },
    status: {
      type: String,
      enum: ["LIVE", "PAUSED", "FLAGGED", "ARCHIVED"],
      default: "LIVE",
    },
    units: { type: [ProjectUnitSchema], default: [] },
    updates: { type: [ProjectUpdateSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Project || model("Project", ProjectSchema);
