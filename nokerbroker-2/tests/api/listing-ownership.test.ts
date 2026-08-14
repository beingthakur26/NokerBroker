import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const isAdminSession = vi.fn();
const findById = vi.fn();
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/admin", () => ({ isAdminSession }));
vi.mock("@/lib/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/models/Property", () => ({ default: { findById } }));
vi.mock("@/lib/serialize", () => ({ toPropertyView: vi.fn() }));
vi.mock("@/lib/validation/listing", () => ({ propertyCreateSchema: { safeParse: vi.fn() } }));

describe("listing ownership", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ user: { id: "buyer" } });
    isAdminSession.mockResolvedValue(false);
    findById.mockResolvedValue({ ownerId: { toString: () => "owner" } });
  });
  it("does not allow another user to modify a listing", async () => {
    const { PATCH } = await import("@/app/api/properties/[id]/route");
    const response = await PATCH(new Request("http://test/api/properties/property", { method: "PATCH", body: JSON.stringify({ title: "Attempt" }), headers: { "content-type": "application/json" } }), { params: Promise.resolve({ id: "property" }) });
    expect(response.status).toBe(403);
  });
});
