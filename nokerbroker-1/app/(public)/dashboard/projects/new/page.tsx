import type { Metadata } from "next";
import { ProjectForm } from "@/components/project-form";

export const metadata: Metadata = {
  title: "List a project",
  description: "Add a RERA-verified new project — live immediately, direct buyer enquiries.",
};

export default function ListProjectPage() {
  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            List a new project
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            Add a RERA number and your project goes live immediately with direct enquiries.
          </p>
        </div>
      </div>
      <ProjectForm />
    </div>
  );
}
