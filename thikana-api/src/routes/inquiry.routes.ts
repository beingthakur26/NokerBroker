import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { createInquiry, getMyInquiries } from "../controllers/inquiry.controller";

const router = Router();

router.post("/", createInquiry);
router.get("/mine", requireAuth, requireRole("BUILDER"), getMyInquiries);

export default router;
