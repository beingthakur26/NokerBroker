import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import {
  approveListing,
  approveProject,
  getAdminListings,
  getAdminProjects,
  getAdminUsers,
  rejectListing,
  rejectProject,
  verifyUser,
} from "../controllers/admin.controller";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/listings", getAdminListings);
router.patch("/listings/:id/approve", approveListing);
router.patch("/listings/:id/reject", rejectListing);
router.get("/projects", getAdminProjects);
router.patch("/projects/:id/approve", approveProject);
router.patch("/projects/:id/reject", rejectProject);
router.get("/users", getAdminUsers);
router.patch("/users/:id/verify", verifyUser);

export default router;
