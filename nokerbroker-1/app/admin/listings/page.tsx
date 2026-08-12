import { requireAdmin } from "@/lib/admin";
import { getAllPropertiesAdmin } from "@/lib/properties-db";
import { AdminListingRow } from "@/components/admin-listing-row";

export const metadata = {
  title: "Listings · Admin",
};

export default async function AdminListingsPage() {
  await requireAdmin();
  const properties = await getAllPropertiesAdmin();
  const live = properties.filter((property) => property.status === "ACTIVE").length;
  const flagged = properties.filter((property) => property.status === "FLAGGED").length;

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Listings
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {properties.length} total · {live} live · {flagged} flagged
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <h2>No listings yet</h2>
          <p>Listings submitted by users appear here.</p>
        </div>
      ) : (
        <div className="dash-list">
          {properties.map((property) => (
            <AdminListingRow
              key={property._id}
              id={property._id}
              slug={property.slug}
              title={property.title}
              locality={property.locality}
              priceValue={property.priceValue}
              status={property.status}
              ownerName={property.ownerName}
              viewCount={property.viewCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
