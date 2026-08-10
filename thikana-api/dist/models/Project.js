"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
    builderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
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
}, { timestamps: true });
projectSchema.index({ locality: 1, status: 1 });
projectSchema.index({ builderId: 1 });
exports.Project = (0, mongoose_1.model)("Project", projectSchema);
