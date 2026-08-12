import Link from "next/link";
import { PropertyImage } from "./property-image";
import type { ProjectView } from "@/lib/serialize";

interface ProjectCardProps {
  project: ProjectView;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusLabel =
    project.constructionStatus === "READY_TO_MOVE"
      ? "Ready to move"
      : project.constructionStatus === "PRE_LAUNCH"
        ? "Pre-launch"
        : "Under construction";

  return (
    <article className="proj-card clickable">
      <Link className="proj-media" href={`/projects/${project.slug}`} aria-label={project.name}>
        <PropertyImage imageUrl={project.images[0]} alt={project.name} />
        <span className="proj-badge"><span className="dot" />RERA verified</span>
        {project.constructionStatus !== "READY_TO_MOVE" && (
          <span className="proj-progress">{project.progressPct}% complete</span>
        )}
      </Link>
      <Link className="proj-body" href={`/projects/${project.slug}`}>
        <h3>{project.name}</h3>
        <p className="loc">{project.locality}</p>
        <div className="proj-stats">
          <div><span>Starting from</span><b>{formatProjectPrice(project)}</b></div>
          <div><span>Unit types</span><b>{project.units.map((unit) => unit.unitType).join(", ") || "—"}</b></div>
          <div><span>Possession</span><b>{statusLabel}</b></div>
        </div>
      </Link>
    </article>
  );
}

function formatProjectPrice(project: ProjectView): string {
  if (!project.units.length) return "—";
  const min = Math.min(...project.units.map((unit) => unit.priceFrom));
  if (min >= 1_00_00_000) {
    const crore = min / 1_00_00_000;
    return `₹${Number.isInteger(crore) ? crore : crore.toFixed(1).replace(/\.0$/, "")} Cr`;
  }
  return `₹${(min / 1_00_000).toFixed(0)} L`;
}
