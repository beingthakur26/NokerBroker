import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { uploadListingFiles } from "../middleware/upload.middleware";
import { createListing, getLiveListings, getListingById, getMyListings } from "../controllers/listing.controller";

const router = Router();

router.get("/", getLiveListings);
router.post("/", requireAuth, requireRole("SELLER", "BUILDER"), uploadListingFiles, createListing);
router.get("/mine", requireAuth, requireRole("SELLER", "BUILDER"), getMyListings);
router.get("/:id", getListingById);

export default router;
