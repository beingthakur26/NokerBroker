"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, trim: true, maxlength: 80 },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["BUYER", "SELLER", "BUILDER", "ADMIN"], required: true },
    verified: { type: Boolean, default: false },
    companyName: { type: String, trim: true, maxlength: 120 },
    reraId: String,
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
