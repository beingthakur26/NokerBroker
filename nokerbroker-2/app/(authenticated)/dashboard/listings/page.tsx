import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPropertiesByOwner } from "@/lib/properties-db";
import { formatPrice } from "@/lib/properties";
import { PropertyImage } from "@/components/property-image";
import { ListingActions } from "@/components/listing-actions";

export const metadata: Metadata = {
  title: "My listings",
  description: "Manage your resale property listings.",
};

export default async function MyListingsPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const properties = await getPropertiesByOwner(userId);

  const statusLabel: Record<string, string> = {
    ACTIVE: "Live",
    SOLD: "Sold",
    RENTED: "Rented",
    DRAFT: "Paused",
    ARCHIVED: "Archived",
    FLAGGED: "Flagged",
  };

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            My listings
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {properties.length} total · {properties.filter((property) => property.status === "ACTIVE").length} live
          </p>
        </div>
        <Link className="btn btn-primary" href="/dashboard/listings/new">+ List a property</Link>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <h2>No listings yet</h2>
          <p>List your flat, house or plot — it goes live immediately and buyers message you directly.</p>
          <Link className="btn btn-primary" href="/dashboard/listings/new">List your first property</Link>
        </div>
      ) : (
        <div className="dash-list">
          {properties.map((property) => (
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
                  <span>{property.areaSqft.toLocaleString("en-IN")} sqft</span>
                  <span>{property.bhk > 0 ? `${property.bhk} BHK` : property.type}</span>
                  <span className={`status status-${property.status.toLowerCase()}`}>
                    {statusLabel[property.status] ?? property.status}
                  </span>
                  <span>{property.viewCount} views</span>
                </div>
              </div>
              <ListingActions id={property._id} status={property.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
