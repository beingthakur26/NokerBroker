import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { getLiveProjects } from "@/lib/projects-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Projects — RERA verified builders",
  description:
    "RERA-verified new projects across Mumbai. Compare starting prices, unit types and possession timelines, then connect with the builder directly.",
};

export default async function ProjectsPage() {
  const projects = await getLiveProjects();

  return (
    <main className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">RERA verified · Direct from builders</p>
            <h1 className="buy-title">New projects in Mumbai</h1>
            <p>Every project carries a RERA number. Message the builder directly — no sales agent in the middle.</p>
          </div>
          <span className="link-more">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </span>
        </div>

        {projects.length ? (
          <div className="proj-grid">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No projects listed yet</h2>
            <p>New RERA-verified projects are added regularly. Check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
