"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedSearch = void 0;
const mongoose_1 = require("mongoose");
const savedSearchSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, maxlength: 80, required: true },
    filters: {
        type: {
            locality: String,
            type: String,
            bhk: Number,
            minPrice: Number,
            maxPrice: Number,
        },
        required: true,
    },
}, { timestamps: true });
savedSearchSchema.index({ userId: 1 });
exports.SavedSearch = (0, mongoose_1.model)("SavedSearch", savedSearchSchema);
