"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const mongoose_1 = require("mongoose");
const favoriteSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["LISTING", "PROJECT"], required: true },
    targetId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
}, { timestamps: true });
favoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
exports.Favorite = (0, mongoose_1.model)("Favorite", favoriteSchema);
