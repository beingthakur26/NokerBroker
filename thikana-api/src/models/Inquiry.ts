import { Schema, model } from "mongoose";

const inquirySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true, maxlength: 80, required: true },
    phone: { type: String, required: true },
    message: { type: String, trim: true, maxlength: 1000 },
    unitType: String,
  },
  { timestamps: true }
);

inquirySchema.index({ projectId: 1 });
inquirySchema.index({ listingId: 1 });

export const Inquiry = model("Inquiry", inquirySchema);
