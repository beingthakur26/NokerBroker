import { Schema, model, models } from "mongoose";

const PropertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    locality: {
      type: String,
      required: true,
      trim: true,
    },

    pinCode: {
      type: String,
      required: true,
      trim: true,
    },

    zone: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    floor: {
      type: String,
      trim: true,
    },

    amenities: {
      type: [String],
      default: [],
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: ["FLAT", "HOUSE", "PLOT", "VILLA", "OFFICE", "SHOP", "OTHER"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    areaSqft: {
      type: Number,
      required: true,
      min: 0,
    },

    bhk: {
      type: Number,
      min: 0,
    },

    furnishing: {
      type: String,
      enum: ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"],
      default: "UNFURNISHED",
    },

    ownershipDocUrl: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SOLD", "RENTED", "DRAFT", "ARCHIVED", "FLAGGED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Property || model("Property", PropertySchema);