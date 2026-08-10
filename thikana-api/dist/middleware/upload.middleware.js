"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProjectImages = exports.uploadListingFiles = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedDocTypes = [...allowedImageTypes, "application/pdf"];
exports.uploadListingFiles = (0, multer_1.default)({
    storage,
    limits: { fileSize: 8 * 1024 * 1024, files: 11 },
    fileFilter: (_req, file, cb) => {
        const allowed = file.fieldname === "ownershipDoc" ? allowedDocTypes : allowedImageTypes;
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type"));
        }
        cb(null, true);
    },
}).fields([
    { name: "images", maxCount: 10 },
    { name: "ownershipDoc", maxCount: 1 },
]);
exports.uploadProjectImages = (0, multer_1.default)({
    storage,
    limits: { fileSize: 8 * 1024 * 1024, files: 10 },
    fileFilter: (_req, file, cb) => {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type"));
        }
        cb(null, true);
    },
}).fields([{ name: "images", maxCount: 10 }]);
