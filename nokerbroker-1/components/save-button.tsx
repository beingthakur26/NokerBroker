"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToastManager } from "@/components/ui/toast";

interface SaveButtonProps {
  slug: string;
  className?: string;
  kind?: "property" | "project";
}

export function SaveButton({ slug, className, kind = "property" }: SaveButtonProps) {
  const { status } = useSession();
  const toasts = useToastManager();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch(`/api/favorites?slug=${encodeURIComponent(slug)}&kind=${kind}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setSaved(Boolean(data.saved));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [status, slug, kind]);

  if (status === "authenticated") {
    return (
      <button
        type="button"
        className={`btn btn-ghost ${saved ? "saved" : ""} ${className ?? ""}`}
        aria-pressed={saved}
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const response = await fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, kind }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "Request failed");
            setSaved(Boolean(data.saved));
            toasts.add({
              type: "success",
              title: data.saved ? "Saved to your shortlist" : "Removed from saved",
            });
          } catch {
            toasts.add({ type: "error", title: "Could not update saved homes" });
          } finally {
            setLoading(false);
          }
        }}
      >
        <Heart size={16} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save home"}
      </button>
    );
  }

  return (
    <Link className={`btn btn-ghost ${className ?? ""}`} href={`/login?next=/buy/${slug}`}>
      <Heart size={16} />
      Log in to save
    </Link>
  );
}
