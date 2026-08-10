"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imagekit_1 = __importDefault(require("imagekit"));
function requiredEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} is not set`);
    return value;
}
const imagekit = new imagekit_1.default({
    publicKey: requiredEnv("IMAGEKIT_PUBLIC_KEY"),
    privateKey: requiredEnv("IMAGEKIT_PRIVATE_KEY"),
    urlEndpoint: requiredEnv("IMAGEKIT_URL_ENDPOINT"),
});
exports.default = imagekit;
