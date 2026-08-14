import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/models/Notification", () => ({ default: { find: vi.fn(), updateMany: vi.fn() } }));
vi.mock("@/lib/inquiries-db", () => ({ getSentInquiries: vi.fn() }));

describe("API authorization", () => {
  beforeEach(() => { auth.mockResolvedValue(null); });
  it("rejects unauthenticated notification requests", async () => {
    const { GET } = await import("@/app/api/notifications/route");
    expect((await GET()).status).toBe(401);
  });
  it("rejects unauthenticated inquiry requests", async () => {
    const { GET } = await import("@/app/api/inquiries/route");
    expect((await GET()).status).toBe(401);
  });
});
