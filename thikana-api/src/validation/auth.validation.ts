import { z } from "zod";

export const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number, e.g. +919812345678"),
});

const otpVerificationFields = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  code: z.string().length(6),
});

export const signupOtpSchema = otpVerificationFields.extend({
  role: z.enum(["BUYER", "SELLER", "BUILDER"]),
});

export const loginOtpSchema = otpVerificationFields;

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "Provide a name or email to update",
  });
