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
      await createNotification(String(search.userId), "SAVED_SEARCH_MATCH", `A new listing matches ${search.title}: ${listing.title}.`, `/buy/${listing.slug}`);
      delivered += 1;
    }
    if (matches.length) await SavedSearch.updateOne({ _id: search._id }, { $addToSet: { deliveredListingIds: { $each: matches.map((match) => String(match._id)) } }, $set: { lastDeliveredAt: new Date() } });
  }
  return delivered;
}
