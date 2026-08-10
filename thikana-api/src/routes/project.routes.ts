import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole, requireVerifiedBuilder } from "../middleware/rbac.middleware";
import { uploadProjectImages } from "../middleware/upload.middleware";
import {
  addUnits,
  createProject,
  deleteUnit,
  getMyProjects,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/project.controller";

const router = Router();

router.get("/", getProjects);
router.post(
  "/",
  requireAuth,
  requireRole("BUILDER"),
  requireVerifiedBuilder,
  uploadProjectImages,
  createProject
);
router.get("/mine", requireAuth, requireRole("BUILDER"), getMyProjects);
router.get("/:id", getProjectById);
router.patch("/:id", requireAuth, requireRole("BUILDER"), updateProject);
router.post("/:id/units", requireAuth, requireRole("BUILDER"), addUnits);
router.delete("/units/:id", requireAuth, requireRole("BUILDER"), deleteUnit);

export default router;
