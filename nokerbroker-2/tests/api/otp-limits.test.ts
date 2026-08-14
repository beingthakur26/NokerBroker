import { beforeEach, describe, expect, it, vi } from "vitest";

const consumeRateLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({ consumeRateLimit }));
vi.mock("@/lib/whatsapp-otp", () => ({ sendWhatsappOtp: vi.fn() }));

describe("OTP limits", () => {
  beforeEach(() => { consumeRateLimit.mockResolvedValue(false); });
  it("returns 429 when shared OTP limiting rejects a valid request", async () => {
    const { POST } = await import("@/app/api/otp/send/route");
    const response = await POST(new Request("http://test/api/otp/send", { method: "POST", body: JSON.stringify({ whatsappNumber: "9876543210" }), headers: { "content-type": "application/json" } }));
    expect(response.status).toBe(429);
  });
});
