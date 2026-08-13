import type { Metadata } from "next";
import { ProjectForm } from "@/components/project-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import BuilderProfile from "@/models/BuilderProfile";

export const metadata: Metadata = {
  title: "List a project",
  description: "Add a RERA-verified new project — live immediately, direct buyer enquiries.",
};

export default async function ListProjectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/dashboard/projects/new");
  await dbConnect();
  const profile = await BuilderProfile.findOne({ userId: session.user.id }, "reraNumber status").lean();
  if (profile?.status !== "VERIFIED") redirect("/dashboard/verification");
  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            List a new project
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>Your builder documents are approved. New project listings can now go live.</p>
        </div>
      </div>
      <ProjectForm reraNumber={profile.reraNumber} />
    </div>
  );
}
