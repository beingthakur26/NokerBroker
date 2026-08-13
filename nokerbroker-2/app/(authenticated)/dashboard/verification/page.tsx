// app/(authenticated)/dashboard/verification/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import BuilderProfile from "@/models/BuilderProfile";
import { serializeDoc } from "@/lib/serialize";
import { BuilderVerificationForm } from "@/components/builder-verification-form";

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
        <p className="text-sm text-ink-soft">Submit RERA and company documents. An administrator must approve them before you can list a new-construction project.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
        {profile && profile.status !== "DENIED" ? (
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
            {profile.status === "PENDING" && <p className="text-sm text-ink-soft">Your documents are awaiting admin review.</p>}
          </div>
        ) : (
          <>
            {profile?.status === "DENIED" && <p className="mb-4 text-sm text-red-700">Your previous submission was denied. Update the information and submit again for review.</p>}
            <BuilderVerificationForm />
          </>
        )}
      </div>
    </div>
  );
}
