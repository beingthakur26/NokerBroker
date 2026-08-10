"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = void 0;
const mongoose_1 = require("mongoose");
const listingSchema = new mongoose_1.Schema({
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["FLAT", "VILLA", "PLOT", "COMMERCIAL"], required: true },
    locality: { type: String, required: true },
    pinCode: { type: String, required: true },
    price: { type: Number, required: true },
    areaSqft: { type: Number, required: true },
    bhk: { type: Number, required: true },
    description: { type: String, trim: true, maxlength: 2000 },
    amenities: [String], // capped at 20 by validation
    images: [String], // public ImageKit URLs
    status: { type: String, enum: ["PENDING", "LIVE", "REJECTED", "PAUSED"], default: "PENDING" },
    ownershipDocPath: { type: String, select: false }, // ImageKit filePath — needs signing to view, excluded from every query by default
}, { timestamps: true });
listingSchema.index({ locality: 1, price: 1, bhk: 1 });
exports.Listing = (0, mongoose_1.model)("Listing", listingSchema);
