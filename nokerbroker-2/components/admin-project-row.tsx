"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, RotateCcw, Loader2 } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";

interface AdminProjectRowProps {
  id: string;
  slug: string;
  name: string;
  locality: string;
  status: string;
  builderName: string;
  constructionStatus: string;
  progressPct: number;
  units: number;
}

export function AdminProjectRow({
  id,
  slug,
  name,
  locality,
  status,
  builderName,
  constructionStatus,
  progressPct,
  units,
}: AdminProjectRowProps) {
  const router = useRouter();
  const toasts = useToastManager();
  const [busy, setBusy] = useState(false);
  const flagged = status === "FLAGGED";

  async function setStatus(next: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      toasts.add({
        type: "success",
        title: next === "FLAGGED" ? "Project flagged" : "Project restored to live",
      });
      router.refresh();
    } catch (error) {
      toasts.add({
        type: "error",
        title: error instanceof Error ? error.message : "Action failed",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash-list-row">
      <div className="dash-list-main">
        <Link href={`/projects/${slug}`} className="dash-list-title">
          {name} · {locality}
        </Link>
        <div className="dash-list-meta">
          <span>by {builderName}</span>
          <span>{constructionStatus.replace(/_/g, " ")}</span>
          <span>{progressPct}% complete</span>
          <span>{units} unit types</span>
          <span className={`status status-${status.toLowerCase()}`}>{status}</span>
        </div>
      </div>
      <div className="dash-list-actions">
        <Link className="btn btn-ghost" href={`/projects/${slug}`}>View</Link>
        {flagged ? (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => setStatus("LIVE")}
          >
            {busy ? <Loader2 size={15} className="spin" /> : <RotateCcw size={15} />}
            Restore
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost danger"
            disabled={busy}
            onClick={() => setStatus("FLAGGED")}
          >
            {busy ? <Loader2 size={15} className="spin" /> : <Flag size={15} />}
            Flag
          </button>
        )}
      </div>
    </div>
  );
}
