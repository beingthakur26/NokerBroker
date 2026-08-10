import rateLimit from "express-rate-limit";

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { error: "Too many OTP requests. Try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: "Too many verification attempts. Request a new OTP and try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
