// models/Notification.ts
import { Schema, model, models, Types } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "LISTING_LIVE",
        "NEW_INQUIRY",
        "INQUIRY_REPLY",
        "INQUIRY_CLOSED",
        "LOAN_STATUS",
        "SAVED_SEARCH_MATCH",
        "BOOKING_UPDATE",
      ],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default models.Notification || model("Notification", NotificationSchema);
