"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inquiry = void 0;
const mongoose_1 = require("mongoose");
const inquirySchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project" },
    listingId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Listing" },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true, maxlength: 80, required: true },
    phone: { type: String, required: true },
    message: { type: String, trim: true, maxlength: 1000 },
    unitType: String,
}, { timestamps: true });
inquirySchema.index({ projectId: 1 });
inquirySchema.index({ listingId: 1 });
exports.Inquiry = (0, mongoose_1.model)("Inquiry", inquirySchema);
