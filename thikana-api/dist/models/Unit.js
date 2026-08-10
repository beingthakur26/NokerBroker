"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const mongoose_1 = require("mongoose");
const unitSchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Project", required: true },
    type: {
        type: String,
        enum: ["STUDIO", "1BHK", "2BHK", "3BHK", "4BHK", "PENTHOUSE", "COMMERCIAL"],
        required: true,
    },
    areaSqft: { type: Number, required: true },
    price: { type: Number, required: true },
    floor: String,
    availableUnits: { type: Number, min: 0, default: 1 },
}, { timestamps: true });
unitSchema.index({ projectId: 1 });
exports.Unit = (0, mongoose_1.model)("Unit", unitSchema);
