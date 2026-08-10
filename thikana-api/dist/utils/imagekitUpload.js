"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBuffer = uploadBuffer;
const imagekit_1 = __importDefault(require("../config/imagekit"));
async function uploadBuffer(buffer, fileName, folder, isPrivate = false) {
    const result = await imagekit_1.default.upload({
        file: buffer, // ImageKit accepts a raw Buffer directly
        fileName,
        folder,
        isPrivateFile: isPrivate, // true = not reachable by a plain URL, needs a signed URL to view
        useUniqueFileName: true,
    });
    return { url: result.url, filePath: result.filePath, fileId: result.fileId };
}
