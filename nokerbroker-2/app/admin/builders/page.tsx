// app/admin/builders/page.tsx
import React from "react";
import dbConnect from "@/lib/mongodb";
import BuilderProfile from "@/models/BuilderProfile";
import { serializeDocs } from "@/lib/serialize";
import { AdminBuilderRow } from "@/components/admin-builder-row";

export default async function AdminBuildersPage() {
  await dbConnect();
  const rawProfiles = await BuilderProfile.find().sort({ createdAt: -1 }).lean();
  const profiles = serializeDocs(rawProfiles);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Builder Entities Moderation</h1>
        <p className="text-sm text-ink-soft">Review RERA and company documents before builders can list new-construction projects.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg-warm text-xs text-ink-soft uppercase">
              <th className="p-4 font-semibold">Company Name</th>
              <th className="p-4 font-semibold">RERA Number</th>
              <th className="p-4 font-semibold">Documents</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Verified Date</th>
              <th className="p-4 font-semibold">Review</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-ink-soft">
                  No builder profiles registered yet.
                </td>
              </tr>
            ) : (
              profiles.map((b: { _id: string; companyName: string; reraNumber: string; status: string; createdAt: string; documentUrls?: string[] }) => (
                <tr key={b._id} className="border-b border-border text-sm">
                  <td className="p-4 font-bold text-ink">{b.companyName}</td>
                  <td className="p-4 font-mono text-ink-soft">{b.reraNumber}</td>
                  <td className="p-4 text-xs">{b.documentUrls?.length ? b.documentUrls.map((url, index) => <a key={url} className="mr-2 text-orange underline" href={url} target="_blank" rel="noreferrer">Document {index + 1}</a>) : "None"}</td>
                  <td className="p-4">
                    <span className="inline-block bg-verified-bg text-verified text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-ink-soft">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4"><AdminBuilderRow id={b._id} status={b.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
