"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignedUrl = getSignedUrl;
const imagekit_1 = __importDefault(require("../config/imagekit"));
function getSignedUrl(filePath, expireSeconds = 3600) {
    return imagekit_1.default.url({ path: filePath, signed: true, expireSeconds });
}
