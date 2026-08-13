import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getFavoriteViews } from "@/lib/favorites-db";
import { formatPrice } from "@/lib/properties";
import { PropertyImage } from "@/components/property-image";

export const metadata: Metadata = {
  title: "Saved homes",
  description: "Your shortlisted properties and projects.",
};

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const { properties, projects } = await getFavoriteViews(userId);
  const total = properties.length + projects.length;

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Saved homes
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>{total} saved</p>
        </div>
        <Link className="btn btn-primary" href="/buy">Browse homes</Link>
      </div>

      {total === 0 ? (
        <div className="empty-state">
          <h2>Nothing saved yet</h2>
          <p>Tap &quot;Save home&quot; on any listing to shortlist it here.</p>
          <Link className="btn btn-primary" href="/buy">Start browsing</Link>
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
                </div>
              </div>
              <div className="dash-list-actions">
                <Link className="btn btn-ghost" href={`/buy/${property.slug}`}>View details</Link>
              </div>
            </div>
          ))}
          {projects.map((project) => (
            <div className="dash-list-row" key={project._id}>
              <div className="dash-list-media">
                <PropertyImage imageUrl={project.images[0]} alt={project.name} sizes="96px" />
              </div>
              <div className="dash-list-main">
                <Link href={`/projects/${project.slug}`} className="dash-list-title">
                  {project.name} · {project.locality}
                </Link>
                <div className="dash-list-meta">
                  <span>RERA verified project</span>
                  <span>{project.constructionStatus.replace(/_/g, " ")}</span>
                </div>
              </div>
              <div className="dash-list-actions">
                <Link className="btn btn-ghost" href={`/projects/${project.slug}`}>View details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
