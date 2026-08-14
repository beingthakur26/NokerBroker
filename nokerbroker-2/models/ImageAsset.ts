import { Schema, model, models, Types } from "mongoose";

const ImageAssetSchema = new Schema({
  url: { type: String, required: true, unique: true },
  sha256: { type: String, required: true, index: true },
  uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

ImageAssetSchema.index({ sha256: 1, createdAt: -1 });

export default models.ImageAsset || model("ImageAsset", ImageAssetSchema);
