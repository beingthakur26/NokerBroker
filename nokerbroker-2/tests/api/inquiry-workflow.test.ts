import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const isAdminSession = vi.fn();
const findById = vi.fn();
const createNotification = vi.fn();
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/admin", () => ({ isAdminSession }));
vi.mock("@/lib/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/models/Inquiry", () => ({ default: { findById } }));
vi.mock("@/models/Property", () => ({ default: { findById: vi.fn() } }));
vi.mock("@/models/Project", () => ({ default: { findById: vi.fn() } }));
vi.mock("@/lib/notifications", () => ({ createNotification }));

describe("inquiry closure workflow", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ user: { id: "owner" } });
    isAdminSession.mockResolvedValue(false);
    createNotification.mockResolvedValue(null);
    findById.mockResolvedValue({ senderId: "buyer", recipientId: "owner", status: "OPEN", save: vi.fn().mockResolvedValue(undefined) });
  });

  it("allows the recipient to close and notifies the sender exactly once", async () => {
    const { PATCH } = await import("@/app/api/inquiries/[id]/route");
    const response = await PATCH(new Request("http://test/api/inquiries/inquiry", { method: "PATCH", body: JSON.stringify({ status: "CLOSED" }) }), { params: Promise.resolve({ id: "inquiry" }) });
    expect(response.status).toBe(200);
    expect(createNotification).toHaveBeenCalledWith("buyer", "INQUIRY_CLOSED", expect.any(String), "/dashboard/inquiries/sent");
  });

  it("rejects a non-participant", async () => {
    auth.mockResolvedValue({ user: { id: "stranger" } });
    const { PATCH } = await import("@/app/api/inquiries/[id]/route");
    expect((await PATCH(new Request("http://test/api/inquiries/inquiry", { method: "PATCH", body: JSON.stringify({ status: "CLOSED" }) }), { params: Promise.resolve({ id: "inquiry" }) })).status).toBe(403);
  });
});
