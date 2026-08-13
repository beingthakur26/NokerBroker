// app/(authenticated)/dashboard/projects/[id]/units/page.tsx
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { serializeDoc } from "@/lib/serialize";
import { ProjectUnitForm } from "@/components/project-unit-form";

interface ProjectUnit {
  _id: string;
  unitType: string;
  priceFrom: number;
  priceTo?: number;
  areaSqft: number;
}

interface ManagedProject {
  name: string;
  units?: ProjectUnit[];
}

interface ProjectUnitsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectUnitsPage({ params }: ProjectUnitsPageProps) {
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
          <h1 className="text-2xl font-bold text-ink">Unit Configuration — {project.name}</h1>
          <p className="text-sm text-ink-soft">Manage unit types, floor plans, and pricing for this project.</p>
        </div>
        <Link href="/dashboard/projects" className="btn btn-outline">
          Back to Projects
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        {project.units && project.units.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.units.map((unit) => (
              <div key={unit._id} className="p-4 border border-border rounded-xl bg-bg-warm/30 space-y-1">
                <h3 className="font-bold text-ink">{unit.unitType}</h3>
                <p className="text-sm text-orange font-semibold">
                  ₹{unit.priceFrom?.toLocaleString("en-IN")} - ₹{unit.priceTo?.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-ink-soft">Carpet Area: {unit.areaSqft} sq.ft</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft text-center py-8">No units configured yet for this project.</p>
        )}
        <ProjectUnitForm projectId={id} />
      </div>
    </div>
  );
}
