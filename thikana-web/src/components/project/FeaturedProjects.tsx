"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "../project/ProjectCard";

interface Project {
  id: string;
  name: string;
  locality: string;
  pinCode: string;
  images: string[];
  constructionStatus: string;
  unitCount: number;
  priceFrom: number | null;
}

export function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    fetch("/api/projects")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Unable to load projects");
        if (active) setProjects((data?.projects ?? []).slice(0, 3));
      })
      .then(() => active && setState("ready"))
      .catch(() => active && setState("error"));

    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Loading projects">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-[310px] rounded-xl2 bg-orange-pale/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <p className="text-sm text-ink-soft">Projects are temporarily unavailable. Please try again shortly.</p>
    );
  }

  if (projects.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        No builder projects yet. Approved builders can{" "}
        <a href="/dashboard/builder" className="font-semibold text-orange-deep">publish their first project</a>.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          name={project.name}
          locality={`${project.locality} · ${project.pinCode}`}
          priceFrom={project.priceFrom}
          imageUrl={project.images[0]}
          unitCount={project.unitCount}
          constructionStatus={project.constructionStatus}
          href={`/projects/${project.id}`}
        />
      ))}
    </div>
  );
}
