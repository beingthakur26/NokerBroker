import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import SavedSearch from "@/models/SavedSearch";
import { createNotification } from "@/lib/notifications";
import { matchesSavedSearch, normalizeSavedSearchFilters } from "@/lib/saved-searches";

type Listing = { _id: unknown; title: string; slug: string; locality: string; price: number; bhk?: number };

export async function deliverSavedSearchMatches(listings?: Listing[]) {
  await dbConnect();
  const activeListings = listings ?? await Property.find({ status: "ACTIVE" }, "title slug locality price bhk").lean() as Listing[];
  const searches = await SavedSearch.find({ alertsOn: true }).lean();
  let delivered = 0;
  for (const search of searches) {
    const filters = normalizeSavedSearchFilters(search.filters);
    if (!filters) continue;
    const previouslyDelivered = new Set(search.deliveredListingIds ?? []);
    const matches = activeListings.filter((listing) => !previouslyDelivered.has(String(listing._id)) && matchesSavedSearch(filters, listing));
    for (const listing of matches) {
      // Claim the listing before sending. The condition makes concurrent publish
      // and cron runs idempotent, including when a user has email-only alerts.
      const claimed = await SavedSearch.findOneAndUpdate(
        { _id: search._id, deliveredListingIds: { $ne: String(listing._id) } },
        { $addToSet: { deliveredListingIds: String(listing._id) }, $set: { lastDeliveredAt: new Date() } },
        { new: true }
      ).lean();
      if (!claimed) continue;
      await createNotification(String(search.userId), "SAVED_SEARCH_MATCH", `A new listing matches ${search.title}: ${listing.title}.`, `/buy/${listing.slug}`);
      delivered += 1;
    }
  }
  return delivered;
}
