import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Project from "@/models/Project";
import { getSentInquiries, getReceivedInquiries } from "@/lib/inquiries-db";
import { InquiriesList } from "@/components/inquiries-list";

export const metadata: Metadata = {
  title: "Inquiries",
  description: "Enquiries you have sent and received.",
};

export default async function InquiriesPage() {
  const session = await auth();
  const userId = session!.user!.id;

  await dbConnect();
  const [properties, projects] = await Promise.all([
    Property.find({ ownerId: userId }, "_id").lean(),
    Project.find({ builderId: userId }, "_id").lean(),
  ]);
  const propertyIds = properties.map((property) => String(property._id));
  const projectIds = projects.map((project) => String(project._id));

  const [sent, received] = await Promise.all([
    getSentInquiries(userId),
    getReceivedInquiries(propertyIds, projectIds),
  ]);

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Inquiries
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {received.length} received · {sent.length} sent
          </p>
        </div>
      </div>

      <InquiriesList received={received} sent={sent} />
    </div>
  );
}
