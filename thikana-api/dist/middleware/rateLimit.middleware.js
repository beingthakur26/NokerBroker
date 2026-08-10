"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpVerificationLimiter = exports.otpLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: { error: "Too many OTP requests. Try again in a few minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.otpVerificationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: "Too many verification attempts. Request a new OTP and try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
