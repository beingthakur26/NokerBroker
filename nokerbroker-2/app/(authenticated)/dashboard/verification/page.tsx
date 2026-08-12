// app/(authenticated)/dashboard/verification/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import BuilderProfile from "@/models/BuilderProfile";
import { serializeDoc } from "@/lib/serialize";

export default async function BuilderVerificationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const rawProfile = await BuilderProfile.findOne({ userId: session.user.id }).lean();
  const profile = rawProfile ? serializeDoc(rawProfile) : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Builder Verification</h1>
        <p className="text-sm text-ink-soft">One-time RERA and company doc verification to list new builder projects.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
        {profile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-soft">Company Name:</span>
              <span className="text-sm font-bold text-ink">{profile.companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-soft">RERA Number:</span>
              <span className="text-sm font-mono text-ink font-bold">{profile.reraNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-soft">Status:</span>
              <span className="inline-block bg-verified-bg text-verified text-xs font-bold px-3 py-1 rounded-full uppercase">
                {profile.status}
              </span>
            </div>
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase mb-1">Company / Developer Name</label>
              <input type="text" className="w-full rounded-xl border border-border px-4 py-2 text-sm" placeholder="e.g. Lodha Group" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink uppercase mb-1">MahaRERA Registration Number</label>
              <input type="text" className="w-full rounded-xl border border-border px-4 py-2 text-sm" placeholder="e.g. P51800012345" required />
            </div>
            <button type="submit" className="btn btn-accent w-full">
              Submit & Verify Instantly
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
