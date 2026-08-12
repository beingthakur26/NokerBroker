// app/(authenticated)/dashboard/inquiries/sent/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Property from "@/models/Property";
import Project from "@/models/Project";
import { serializeDocs } from "@/lib/serialize";

export default async function SentInquiriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const rawInquiries = await Inquiry.find({ senderId: session.user.id })
    .populate({ path: "propertyId", model: Property, select: "title locality price type images slug" })
    .populate({ path: "projectId", model: Project, select: "name locality constructionStatus reraNumber slug" })
    .sort({ createdAt: -1 })
    .lean();

  const inquiries = serializeDocs(rawInquiries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Sent Inquiries</h1>
        <p className="text-sm text-ink-soft">Enquiries you sent to sellers and project developers.</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-ink-soft">You have not sent any inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq: any) => (
            <div key={inq._id} className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>Contact Mode: <strong className="text-ink">{inq.contactMode}</strong></span>
                <span>Status: <strong className="text-orange">{inq.status}</strong></span>
              </div>
              <p className="text-sm font-medium text-ink">"{inq.message}"</p>
              {inq.propertyId && (
                <div className="text-xs text-ink-soft">
                  Property: <span className="font-semibold text-ink">{inq.propertyId.title} ({inq.propertyId.locality})</span>
                </div>
              )}
              {inq.projectId && (
                <div className="text-xs text-ink-soft">
                  Project: <span className="font-semibold text-ink">{inq.projectId.name} ({inq.projectId.locality})</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
