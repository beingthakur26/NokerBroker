import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getReceivedInquiries, getSentInquiries } from "@/lib/inquiries-db";
import { getPropertiesByOwner } from "@/lib/properties-db";
import { getProjectsByBuilder } from "@/lib/projects-db";
import { InquiriesList } from "@/components/inquiries-list";

export const metadata: Metadata = { title: "Inquiries", description: "Enquiries you have sent to NokerBroker." };

export default async function InquiriesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [sent, properties, projects] = userId
    ? await Promise.all([getSentInquiries(userId), getPropertiesByOwner(userId), getProjectsByBuilder(userId)])
    : [[], [], []];
  const received = userId
    ? await getReceivedInquiries(properties.map((property) => property._id), projects.map((project) => project._id), userId)
    : [];
  return <div>
    <div className="dash-head-row"><div>
      <p className="eyebrow">Dashboard</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>Inquiries</h1>
      <p style={{ color: "var(--ink-soft)" }}>{received.length} received · {sent.length} sent</p>
    </div></div>
    <InquiriesList received={received} sent={sent} />
  </div>;
}
