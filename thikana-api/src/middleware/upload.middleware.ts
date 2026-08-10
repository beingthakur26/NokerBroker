import multer from "multer";

const storage = multer.memoryStorage();
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedDocTypes = [...allowedImageTypes, "application/pdf"];

export const uploadListingFiles = multer({
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