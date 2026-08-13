import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSentInquiries } from "@/lib/inquiries-db";
import { InquiriesList } from "@/components/inquiries-list";

export const metadata: Metadata = { title: "Inquiries", description: "Enquiries you have sent to NokerBroker." };

export default async function InquiriesPage() {
  const session = await auth();
  const sent = session?.user?.id ? await getSentInquiries(session.user.id) : [];
  return <div>
    <div className="dash-head-row"><div>
      <p className="eyebrow">Dashboard</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>Inquiries</h1>
      <p style={{ color: "var(--ink-soft)" }}>{sent.length} sent · NokerBroker will contact you directly</p>
    </div></div>
    <InquiriesList received={[]} sent={sent} />
  </div>;
}
