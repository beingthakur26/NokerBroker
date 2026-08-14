import { Schema, model, models } from "mongoose";

const InquiryMessageSchema = new Schema(
  {
    inquiryId: { type: Schema.Types.ObjectId, ref: "Inquiry", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 2_000 },
    readAt: { type: Date },
  },
  { timestamps: true }
);

InquiryMessageSchema.index({ inquiryId: 1, createdAt: 1 });

export default models.InquiryMessage || model("InquiryMessage", InquiryMessageSchema);
