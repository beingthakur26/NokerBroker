import { Schema, model, models } from "mongoose";

const InquirySchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    message: { type: String, required: true, trim: true },
    contactMode: {
      type: String,
      enum: ["CALL", "CHAT", "WHATSAPP", "BOTH"],
      default: "WHATSAPP",
    },
    status: {
      type: String,
      enum: ["OPEN", "RESPONDED", "CLOSED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

InquirySchema.index({ senderId: 1, createdAt: -1 });
InquirySchema.index({ propertyId: 1, createdAt: -1 });

export default models.Inquiry || model("Inquiry", InquirySchema);

export type InquiryStatus = "OPEN" | "RESPONDED" | "CLOSED";
export type ContactMode = "CALL" | "CHAT" | "WHATSAPP" | "BOTH";
