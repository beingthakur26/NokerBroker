import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { calculateEmi, calculateLoanBreakdown } from "@/lib/emi";
import { isValidIndianNumber, normalizeIndianNumber, toMsg91Mobile } from "@/lib/phone";
import { propertyCreateSchema } from "@/lib/validation/listing";
import { encryptSensitive } from "@/lib/sensitive-data";
import { escapeRegex } from "@/lib/search";

describe("core helpers", () => {
  it("calculates a stable EMI and loan breakdown", () => {
    expect(calculateEmi(5_000_000, 8.5, 20)).toBe(43391);
    expect(calculateLoanBreakdown(5_000_000, 8.5, 20)).toMatchObject({ monthlyEmi: 43391, totalPayment: 10413840 });
    expect(calculateEmi(0, 8.5, 20)).toBe(0);
  });
  it("normalizes and validates Indian numbers", () => {
    expect(normalizeIndianNumber("09876543210")).toBe("+919876543210");
    expect(toMsg91Mobile("+91 98765 43210")).toBe("919876543210");
    expect(isValidIndianNumber("9876543210")).toBe(true);
    expect(isValidIndianNumber("1234567890")).toBe(false);
  });
  it("rejects malformed listings", () => {
    const result = propertyCreateSchema.safeParse({ title: "A", locality: "M", pinCode: "12", type: "FLAT", furnishing: "UNFURNISHED", price: -1, areaSqft: 0, ownershipDocUrl: "not-url" });
    expect(result.success).toBe(false);
  });
  it("encrypts sensitive values with fresh authenticated ciphertext", () => {
    process.env.DATA_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
    const first = encryptSensitive("ABCDE1234F");
    const second = encryptSensitive("ABCDE1234F");
    expect(first).toMatch(/^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(first).not.toBe(second);
  });
  it("escapes regular-expression metacharacters", () => {
    expect(escapeRegex("Andheri (West)+.*")).toBe("Andheri \\(West\\)\\+\\.\\*");
  });
});
