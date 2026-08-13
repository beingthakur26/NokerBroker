import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/properties";
import { getProjectBySlug, getLiveProjects } from "@/lib/projects-db";
import { PropertyGallery } from "@/components/property-gallery";
import { ProjectCard } from "@/components/project-card";
import { EnquiryDialog } from "@/components/enquiry-dialog";
import { SaveButton } from "@/components/save-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = await getProjectBySlug(projectSlug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.name} — ${project.locality}`,
    description: project.description || `${project.name} in ${project.locality}, RERA verified.`,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const project = await getProjectBySlug(projectSlug);
  if (!project) notFound();

  const allProjects = await getLiveProjects();
  const related = allProjects
    .filter((item) => item.slug !== project.slug)
    .sort((a, b) => {
      const aScore = (a.locality === project.locality ? 2 : 0);
      const bScore = (b.locality === project.locality ? 2 : 0);
      return bScore - aScore;
    })
    .slice(0, 3);

  const statusLabel =
    project.constructionStatus === "READY_TO_MOVE"
      ? "Ready to move"
      : project.constructionStatus === "PRE_LAUNCH"
        ? "Pre-launch"
        : "Under construction";

  return (
    <main className="section">
      <div className="wrap">
        <Link className="link-more" href="/projects">← Back to projects</Link>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-head">
              <div>
                <p className="eyebrow">RERA verified project</p>
                <h1 className="detail-title">{project.name}</h1>
                <p className="prop-loc" style={{ fontSize: 15 }}>{project.locality}</p>
              </div>
            </div>

            <PropertyGallery images={project.images} title={project.name} />

            <section className="detail-block">
              <h2>About this project</h2>
              <p className="detail-desc">
                {project.description || `${project.name} in ${project.locality} — connect with the builder directly.`}
              </p>
              <div className="detail-facts">
                <div><span>Status</span><b>{statusLabel}</b></div>
                <div><span>Construction</span><b>{project.progressPct}% complete</b></div>
                <div><span>RERA number</span><b>{project.reraNumber || "—"}</b></div>
                <div><span>PIN code</span><b>{project.pinCode}</b></div>
              </div>
              {project.amenities.length > 0 && (
                <div className="amenity-row">
                  {project.amenities.map((amenity) => (
                    <span className="badge" key={amenity}>{amenity}</span>
                  ))}
                </div>
              )}
            </section>

            <section className="detail-block">
              <h2>Unit configurations</h2>
              <div className="unit-table">
                {project.units.map((unit, index) => (
                  <div className="unit-row" key={unit._id ?? index}>
                    <div className="unit-type">{unit.unitType}</div>
                    <div className="unit-area">{unit.areaSqft.toLocaleString("en-IN")} sqft</div>
                    <div className="unit-price">
                      {unit.priceTo
                        ? `${formatINR(unit.priceFrom)} – ${formatINR(unit.priceTo)}`
                        : formatINR(unit.priceFrom)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {project.updates.length > 0 && (
              <section className="detail-block">
                <h2>Construction updates</h2>
                <div className="amenity-row">
                  {project.updates.map((update) => (
                    <div key={update._id ?? update.month}>
                      <b>{new Date(update.month).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</b>
                      {update.note && <p className="detail-desc">{update.note}</p>}
                      {update.imageUrls.map((url) => <a key={url} className="link-more" href={url} target="_blank" rel="noreferrer">View progress photo</a>)}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="detail-side">
            <div className="detail-card">
              <div className="detail-price">{formatMinPrice(project)}</div>
              <p className="detail-loc">Starting price in {project.locality}</p>

              <EnquiryDialog
                slug={project.slug}
                kind="project"
                nextPath={`/projects/${project.slug}`}
                listingLabel={`${project.name} in ${project.locality}`}
              />
              <SaveButton slug={project.slug} kind="project" />

              <div className="detail-owner">
                <div className="avatar">{project.builderName.charAt(0)}</div>
                <div>
                  <b>{project.builderName}</b>
                  <span>RERA verified builder · Direct contact</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="related">
            <div className="section-head">
              <div>
                <h2>More projects</h2>
                <p>Other RERA-verified projects near this one.</p>
              </div>
              <Link className="link-more" href="/projects">View all →</Link>
            </div>
            <div className="proj-grid">
              {related.map((item) => (
                <ProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function formatMinPrice(project: { units: { priceFrom: number }[] }): string {
  if (!project.units.length) return "Price on request";
  const min = Math.min(...project.units.map((unit) => unit.priceFrom));
  if (min >= 1_00_00_000) {
    const crore = min / 1_00_00_000;
    return `₹${Number.isInteger(crore) ? crore : crore.toFixed(1).replace(/\.0$/, "")} Cr`;
  }
  return `₹${(min / 1_00_000).toFixed(0)} L`;
}
