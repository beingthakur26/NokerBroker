import { Router } from "express";
import { logout, me, requestOtp, updateProfile, verifyLoginOtp, verifySignupOtp } from "../controllers/auth.controller";
import { otpLimiter, otpVerificationLimiter } from "../middleware/rateLimit.middleware";
import { requireAuth } from "../middleware/auth.middleware";


const router = Router();

router.post("/request-otp", otpLimiter, requestOtp);
router.post("/verify-signup-otp", otpVerificationLimiter, verifySignupOtp);
router.post("/verify-login-otp", otpVerificationLimiter, verifyLoginOtp);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateProfile);
router.post("/logout", requireAuth, logout);

export default router;
