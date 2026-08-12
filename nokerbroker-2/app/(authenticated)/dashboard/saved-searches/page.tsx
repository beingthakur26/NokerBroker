// app/(authenticated)/dashboard/saved-searches/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import SavedSearch from "@/models/SavedSearch";
import { serializeDocs } from "@/lib/serialize";

export default async function SavedSearchesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const rawSearches = await SavedSearch.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const savedSearches = serializeDocs(rawSearches);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Saved Searches & Alerts</h1>
        <p className="text-sm text-ink-soft">Get instant WhatsApp and email notifications when new matching properties list.</p>
      </div>

      {savedSearches.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-ink-soft">No saved searches found. Save a search from the property search page to receive alerts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedSearches.map((search: any) => (
            <div key={search._id} className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-2">
              <h3 className="font-bold text-ink text-base">{search.title}</h3>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>Alerts: <strong className="text-orange">{search.alertsOn ? "Enabled" : "Disabled"}</strong></span>
                <span>Saved on: {new Date(search.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
