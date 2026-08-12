// models/Booking.ts
import { Schema, model, models, Types } from "mongoose";

const BookingSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    projectId: { type: Types.ObjectId, ref: "Project", required: true },
    unitId: { type: Types.ObjectId, required: true },
    status: {
      type: String,
      enum: [
        "ENQUIRED",
        "SITE_VISIT_SCHEDULED",
        "TOKEN_PAID",
        "BOOKED",
        "AGREEMENT_SIGNED",
        "CANCELLED",
      ],
      default: "ENQUIRED",
    },
    tokenAmount: { type: Number },
    paymentRef: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ projectId: 1, createdAt: -1 });

export default models.Booking || model("Booking", BookingSchema);
