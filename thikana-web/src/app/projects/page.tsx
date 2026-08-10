"use client";

import { useCallback, useEffect, useState } from "react";
import { ProjectCard } from "../../components/project/ProjectCard";
import { Button } from "../../components/ui/Button";

interface Project {
  id: string;
  name: string;
  locality: string;
  pinCode: string;
  description: string;
  reraId: string;
  images: string[];
  amenities: string[];
  possessionDate: string | null;
  constructionStatus: string;
  unitCount: number;
  priceFrom: number | null;
  builderName: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [locality, setLocality] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const load = useCallback(async (localityFilter: string) => {
    const qs = localityFilter.trim()
      ? `?locality=${encodeURIComponent(localityFilter.trim())}`
      : "";
    const res = await fetch(`/api/projects${qs}`);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Unable to load projects");
    return data?.projects ?? [];
  }, []);

  useEffect(() => {
    let active = true;
    load("")
      .then((results) => {
        if (active) {
          setProjects(results);
          setState("ready");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load projects");
          setState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [load]);

  function runSearch() {
    setState("loading");
    setError("");
    load(locality)
      .then((results) => {
        setProjects(results);
        setState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load projects");
        setState("error");
      });
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">New projects</span>
      <h1 className="font-display text-3xl text-ink mt-2">Builder projects in Mumbai</h1>
      <p className="text-sm text-ink-soft mt-2 max-w-[560px]">
        RERA-verified projects from verified builders. Every project is approved by our team before going live.
      </p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <input
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Filter by locality…"
          className="min-w-[240px] flex-1 border-[1.5px] border-border rounded-full px-4 py-2.5 text-sm"
        />
        <Button variant="accent" onClick={runSearch}>
          Search
        </Button>
      </div>

      {state === "loading" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Loading projects">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[310px] rounded-xl2 bg-orange-pale/50 animate-pulse" />
          ))}
        </div>
      )}

      {state === "error" && <p className="mt-8 text-sm text-ink-soft">{error}</p>}

      {state === "ready" && projects.length === 0 && (
        <p className="mt-8 text-sm text-ink-soft">No projects match yet. Try another locality.</p>
      )}

      {state === "ready" && projects.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
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
      )}
    </main>
  );
}
