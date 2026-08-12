import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";
import Project from "@/models/Project";
import Inquiry from "@/models/Inquiry";
import Favorite from "@/models/Favorite";
import { getLiveProperties } from "@/lib/properties-db";
import { getAllInquiriesAdmin } from "@/lib/inquiries-db";
import { PropertyImage } from "@/components/property-image";
import { formatPrice } from "@/lib/properties";

export const metadata = {
  title: "Admin overview",
};

const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

export default async function AdminOverviewPage() {
  await requireAdmin();
  await dbConnect();

  const [users, properties, projects, inquiries, favorites] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Project.countDocuments(),
    Inquiry.countDocuments(),
    Favorite.countDocuments(),
  ]);

  const [newUsers, newProperties, activeProperties, flaggedProperties, liveProjects, openInquiries] =
    await Promise.all([
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Property.countDocuments({ createdAt: { $gte: weekAgo } }),
      Property.countDocuments({ status: "ACTIVE" }),
      Property.countDocuments({ status: "FLAGGED" }),
      Project.countDocuments({ status: "LIVE" }),
      Inquiry.countDocuments({ status: "OPEN" }),
    ]);

  const [live, latestInquiries] = await Promise.all([
    getLiveProperties(),
    getAllInquiriesAdmin(),
  ]);
  const topProperties = [...live]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4);

  const stats = [
    { label: "Users", value: users, sub: `${newUsers} new this week`, href: "/admin/users" },
    { label: "Listings", value: properties, sub: `${activeProperties} live · ${flaggedProperties} flagged · ${newProperties} new this week`, href: "/admin/listings" },
    { label: "Projects", value: projects, sub: `${liveProjects} live`, href: "/admin/projects" },
    { label: "Inquiries", value: inquiries, sub: `${openInquiries} open`, href: "/admin/inquiries" },
  ];

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Overview
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {favorites} saved favourites across the marketplace
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <Link className="stat-card" key={stat.label} href={stat.href}>
            <span className="stat-label">{stat.label}</span>
            <b>{stat.value}</b>
            <small>{stat.sub}</small>
          </Link>
        ))}
      </div>

      <div className="admin-panels">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Top viewed listings</h2>
            <Link href="/admin/listings">All listings →</Link>
          </div>
          {topProperties.length === 0 ? (
            <p className="muted">No live listings yet.</p>
          ) : (
            <div className="dash-list">
              {topProperties.map((property) => (
                <div className="dash-list-row" key={property._id}>
                  <div className="dash-list-media">
                    <PropertyImage imageUrl={property.images[0]} alt={property.title} sizes="96px" />
                  </div>
                  <div className="dash-list-main">
                    <Link href={`/buy/${property.slug}`} className="dash-list-title">
                      {property.title} · {property.locality}
                    </Link>
                    <div className="dash-list-meta">
                      <span>{formatPrice(property.priceValue)}</span>
                      <span>{property.viewCount} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Latest inquiries</h2>
            <Link href="/admin/inquiries">All inquiries →</Link>
          </div>
          {latestInquiries.length === 0 ? (
            <p className="muted">No inquiries yet.</p>
          ) : (
            <div className="dash-list">
              {latestInquiries.slice(0, 5).map((inquiry) => (
                <div className="dash-list-row" key={inquiry._id}>
                  <div className="dash-list-main">
                    <div className="dash-list-title">
                      {inquiry.propertyTitle ?? inquiry.projectName ?? "Property enquiry"}
                    </div>
                    <div className="dash-list-meta">
                      <span>{inquiry.senderName}</span>
                      <span className={`status status-${inquiry.status.toLowerCase()}`}>
                        {inquiry.status}
                      </span>
                      <span>{new Date(inquiry.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
