import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();
const findOneAndUpdate = vi.fn();
const createNotification = vi.fn();
vi.mock("@/lib/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/models/Property", () => ({ default: { find: vi.fn() } }));
vi.mock("@/models/SavedSearch", () => ({ default: { find, findOneAndUpdate } }));
vi.mock("@/lib/notifications", () => ({ createNotification }));
vi.mock("@/lib/saved-searches", () => ({ normalizeSavedSearchFilters: vi.fn(() => ({ locality: "Bandra" })), matchesSavedSearch: vi.fn(() => true) }));

describe("saved-search delivery", () => {
  beforeEach(() => {
    find.mockReturnValue({ lean: vi.fn().mockResolvedValue([{ _id: "search", userId: "user", title: "Bandra", filters: { locality: "Bandra" }, alertsOn: true, deliveredListingIds: [] }]) });
    findOneAndUpdate.mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: "search" }) });
    createNotification.mockResolvedValue(null); // email-only delivery has no in-app record
  });

  it("claims a match before delivering it, preventing duplicate sends", async () => {
    const { deliverSavedSearchMatches } = await import("@/lib/saved-search-delivery");
    await expect(deliverSavedSearchMatches([{ _id: "listing", title: "Home", slug: "home", locality: "Bandra", price: 1 }])).resolves.toBe(1);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "search", deliveredListingIds: { $ne: "listing" } },
      expect.objectContaining({ $addToSet: { deliveredListingIds: "listing" } }),
      { new: true }
    );
    expect(createNotification).toHaveBeenCalledOnce();
  });
});
