import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getProjectsByBuilder } from "@/lib/projects-db";
import { PropertyImage } from "@/components/property-image";

export const metadata: Metadata = {
  title: "My projects",
  description: "Manage your RERA-verified projects.",
};

export default async function MyProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const projects = await getProjectsByBuilder(userId);

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            My projects
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {projects.length} project{projects.length === 1 ? "" : "s"} · RERA verified
          </p>
        </div>
        <Link className="btn btn-primary" href="/dashboard/projects/new">+ List a project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>List your RERA-verified project to start receiving direct buyer enquiries.</p>
          <Link className="btn btn-primary" href="/dashboard/projects/new">List your first project</Link>
        </div>
      ) : (
        <div className="dash-list">
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
                  <span>RERA {project.reraNumber || "—"}</span>
                  <span>{project.constructionStatus.replace(/_/g, " ")}</span>
                  <span>{project.progressPct}% complete</span>
                  <span>{project.units.length} unit type{project.units.length === 1 ? "" : "s"}</span>
                  <span className="status status-live">Live</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
