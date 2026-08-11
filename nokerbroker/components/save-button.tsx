"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToastManager } from "@/components/ui/toast";

export function SaveButton({ slug, className }: { slug: string; className?: string }) {
  const { status } = useSession();
  const toasts = useToastManager();
  const [saved, setSaved] = useState(false);

  if (status === "authenticated") {
    return (
      <button
        type="button"
        className={`btn btn-ghost ${saved ? "saved" : ""} ${className ?? ""}`}
        aria-pressed={saved}
        onClick={() => {
          setSaved((value) => !value);
          toasts.add({ type: "success", title: saved ? "Removed from saved" : "Saved to your shortlist" });
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
