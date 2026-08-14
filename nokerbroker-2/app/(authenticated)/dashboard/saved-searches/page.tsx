// app/(authenticated)/dashboard/saved-searches/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import SavedSearch from "@/models/SavedSearch";
import { serializeDocs } from "@/lib/serialize";
import { SavedSearchManager } from "@/components/saved-search-manager";

interface SavedSearchItem {
  _id: string;
  title: string;
  alertsOn: boolean;
  createdAt: string;
}

export default async function SavedSearchesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const rawSearches = await SavedSearch.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const savedSearches = serializeDocs(rawSearches) as unknown as SavedSearchItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Saved Searches & Alerts</h1>
        <p className="text-sm text-ink-soft">Create searches and receive in-app alerts when newly published listings match.</p>
      </div>
      <SavedSearchManager searches={savedSearches} />
    </div>
  );
}
