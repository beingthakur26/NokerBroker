import { requireAdmin } from "@/lib/admin";
import { getAllProjectsAdmin } from "@/lib/projects-db";
import { AdminProjectRow } from "@/components/admin-project-row";

export const metadata = {
  title: "Projects · Admin",
};

export default async function AdminProjectsPage() {
  await requireAdmin();
  const projects = await getAllProjectsAdmin();
  const live = projects.filter((project) => project.status === "LIVE").length;
  const flagged = projects.filter((project) => project.status === "FLAGGED").length;

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Projects
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {projects.length} total · {live} live · {flagged} flagged
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>RERA-registered projects submitted by builders appear here.</p>
        </div>
      ) : (
        <div className="dash-list">
          {projects.map((project) => (
            <AdminProjectRow
              key={project._id}
              id={project._id}
              slug={project.slug}
              name={project.name}
              locality={project.locality}
              status={project.status}
              builderName={project.builderName}
              constructionStatus={project.constructionStatus}
              progressPct={project.progressPct}
              units={project.units.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
