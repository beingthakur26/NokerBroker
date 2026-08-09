import { z } from "zod";

export const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number, e.g. +919812345678"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  code: z.string().length(6),
  role: z.enum(["BUYER", "SELLER", "BUILDER"]),
});