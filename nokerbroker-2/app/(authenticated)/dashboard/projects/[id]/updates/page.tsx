// app/(authenticated)/dashboard/projects/[id]/updates/page.tsx
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { serializeDoc } from "@/lib/serialize";
import { ProjectUpdateForm } from "@/components/project-update-form";

interface ProjectUpdate {
  _id: string;
  month: string;
  note?: string;
}

interface ManagedProject {
  name: string;
  updates?: ProjectUpdate[];
}

interface ProjectUpdatesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectUpdatesPage({ params }: ProjectUpdatesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  await dbConnect();
  const rawProject = await Project.findOne({ _id: id, builderId: session.user.id }).lean();

  if (!rawProject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-ink">Project Not Found</h2>
        <Link href="/dashboard/projects" className="btn btn-accent mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const project = serializeDoc(rawProject) as unknown as ManagedProject;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Construction Updates — {project.name}</h1>
          <p className="text-sm text-ink-soft">Post monthly construction progress photos and notes.</p>
        </div>
        <Link href="/dashboard/projects" className="btn btn-outline">
          Back to Projects
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        {project.updates && project.updates.length > 0 ? (
          <div className="space-y-4">
            {project.updates.map((update) => (
              <div key={update._id} className="p-4 border border-border rounded-xl bg-bg-warm/30 space-y-2">
                <span className="text-xs text-orange font-bold uppercase">
                  {new Date(update.month).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </span>
                <p className="text-sm text-ink">{update.note || "No note added."}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft text-center py-8">No construction updates posted yet.</p>
        )}
        <ProjectUpdateForm projectId={id} />
      </div>
    </div>
  );
}
