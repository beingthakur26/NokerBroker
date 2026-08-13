import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Inquiry from "@/models/Inquiry";

export const metadata = { title: "Listing analytics" };

export default async function ListingAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  await dbConnect();
  const property = await Property.findOne({ _id: id, ownerId: session?.user?.id }).lean();
  if (!property) notFound();

  const [inquiries, openInquiries] = await Promise.all([
    Inquiry.countDocuments({ propertyId: property._id }),
    Inquiry.countDocuments({ propertyId: property._id, status: "OPEN" }),
  ]);

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Listing insights</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>{property.title}</h1>
          <p style={{ color: "var(--ink-soft)" }}>Performance for your listing in {property.locality}.</p>
        </div>
        <Link className="btn btn-ghost" href={`/dashboard/listings/${id}/edit`}>Edit listing</Link>
      </div>
      <div className="dash-stats">
        <div className="dash-stat"><span>Total views</span><strong>{property.viewCount ?? 0}</strong></div>
        <div className="dash-stat"><span>Total inquiries</span><strong>{inquiries}</strong></div>
        <div className="dash-stat"><span>Open inquiries</span><strong>{openInquiries}</strong></div>
      </div>
      <div className="empty-state">
        <h2>Keep your listing current</h2>
        <p>Fresh photos, accurate details, and a competitive price help buyers make a decision faster.</p>
        <Link className="btn btn-primary" href={`/buy/${property.slug}`}>View public listing</Link>
      </div>
    </div>
  );
}
