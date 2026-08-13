import { requireAdmin } from "@/lib/admin";
import { getAllPropertiesAdmin } from "@/lib/properties-db";
import { getAllProjectsAdmin } from "@/lib/projects-db";
import { AdminListingRow } from "@/components/admin-listing-row";
import { AdminProjectRow } from "@/components/admin-project-row";

export const metadata = { title: "Moderation · Admin" };

export default async function ModerationPage() {
  await requireAdmin();
  const [properties, projects] = await Promise.all([getAllPropertiesAdmin(), getAllProjectsAdmin()]);
  const flaggedProperties = properties.filter((property) => property.status === "FLAGGED");
  const flaggedProjects = projects.filter((project) => project.status === "FLAGGED");
  const total = flaggedProperties.length + flaggedProjects.length;

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>Moderation</h1>
          <p style={{ color: "var(--ink-soft)" }}>{total} flagged item{total === 1 ? "" : "s"} awaiting review</p>
        </div>
      </div>
      {total === 0 ? (
        <div className="empty-state"><h2>Nothing needs review</h2><p>Flagged listings and projects appear here for restoration or follow-up.</p></div>
      ) : (
        <div className="inq-list">
          {flaggedProperties.length > 0 && <section><h2 style={{ marginBottom: 12 }}>Flagged listings</h2><div className="dash-list">{flaggedProperties.map((property) => <AdminListingRow key={property._id} id={property._id} slug={property.slug} title={property.title} locality={property.locality} priceValue={property.priceValue} status={property.status} ownerName={property.ownerName} viewCount={property.viewCount} />)}</div></section>}
          {flaggedProjects.length > 0 && <section><h2 style={{ marginBottom: 12 }}>Flagged projects</h2><div className="dash-list">{flaggedProjects.map((project) => <AdminProjectRow key={project._id} id={project._id} slug={project.slug} name={project.name} locality={project.locality} status={project.status} builderName={project.builderName} constructionStatus={project.constructionStatus} progressPct={project.progressPct} units={project.units.length} />)}</div></section>}
        </div>
      )}
    </div>
  );
}
