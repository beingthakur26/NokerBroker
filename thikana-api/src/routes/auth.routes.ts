import { Router } from "express";
import { requestOtp, verifyOtp } from "../controllers/auth.controller";
import { otpLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/request-otp", otpLimiter, requestOtp);
router.post("/verify-otp", verifyOtp);

export default router;