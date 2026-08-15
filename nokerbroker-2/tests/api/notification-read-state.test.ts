import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const find = vi.fn();
const countDocuments = vi.fn();
const updateMany = vi.fn();
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/models/Notification", () => ({ default: { find, countDocuments, updateMany } }));

describe("notification read state", () => {
  beforeEach(() => {
    vi.resetModules();
    auth.mockResolvedValue({ user: { id: "user-1" } });
    find.mockReturnValue({ sort: () => ({ limit: () => ({ lean: vi.fn().mockResolvedValue([{ _id: "new", read: false }]) }) }) });
    countDocuments.mockResolvedValue(17);
    updateMany.mockResolvedValue({ modifiedCount: 17 });
  });

  it("returns the complete unread count even when the response is paged", async () => {
    const { GET } = await import("@/app/api/notifications/route");
    const response = await GET();
    expect((await response.json()).unreadCount).toBe(17);
    expect(countDocuments).toHaveBeenCalledWith({ userId: "user-1", read: false });
  });

  it("marks every unread notification as read for the current user", async () => {
    const { PATCH } = await import("@/app/api/notifications/route");
    expect((await PATCH()).status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith({ userId: "user-1", read: false }, { read: true });
  });
});
