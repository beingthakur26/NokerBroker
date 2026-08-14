"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, RotateCcw, Loader2 } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";

interface AdminListingRowProps {
  id: string;
  slug: string;
  title: string;
  locality: string;
  priceValue: number;
  status: string;
  ownerName: string;
  viewCount: number;
  duplicateReview?: { flagged: boolean; reason?: string };
}

export function AdminListingRow({
  id,
  slug,
  title,
  locality,
  priceValue,
  status,
  ownerName,
  viewCount,
  duplicateReview,
}: AdminListingRowProps) {
  const router = useRouter();
  const toasts = useToastManager();
  const [busy, setBusy] = useState(false);
  const flagged = status === "FLAGGED";
  const live = status === "ACTIVE";

  async function setStatus(next: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      toasts.add({
        type: "success",
        title: next === "FLAGGED" ? "Listing flagged" : "Listing restored to live",
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

  async function resolveDuplicate() {
    setBusy(true);
    try {
      const response = await fetch(`/api/properties/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resolveDuplicate: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      toasts.add({ type: "success", title: "Duplicate review marked complete" });
      router.refresh();
    } catch (error) { toasts.add({ type: "error", title: error instanceof Error ? error.message : "Action failed" }); }
    finally { setBusy(false); }
  }

  return (
    <div className="dash-list-row">
      <div className="dash-list-main">
        <Link href={`/buy/${slug}`} className="dash-list-title">
          {title} · {locality}
        </Link>
        <div className="dash-list-meta">
          <span>₹{priceValue.toLocaleString("en-IN")}</span>
          <span>by {ownerName}</span>
          <span>{viewCount} views</span>
          <span className={`status status-${status.toLowerCase()}`}>{status}</span>
          {duplicateReview?.flagged && <span className="status status-flagged" title={duplicateReview.reason}>Duplicate-photo review</span>}
          {duplicateReview?.reason && <span>{duplicateReview.reason}</span>}
        </div>
      </div>
      <div className="dash-list-actions">
        <Link className="btn btn-ghost" href={`/buy/${slug}`}>View</Link>
        {duplicateReview?.flagged && <button type="button" className="btn btn-ghost" disabled={busy} onClick={resolveDuplicate}>Mark reviewed</button>}
        {flagged ? (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => setStatus("ACTIVE")}
          >
            {busy ? <Loader2 size={15} className="spin" /> : <RotateCcw size={15} />}
            Restore
          </button>
        ) : live ? (
          <button
            type="button"
            className="btn btn-ghost danger"
            disabled={busy}
            onClick={() => setStatus("FLAGGED")}
          >
            {busy ? <Loader2 size={15} className="spin" /> : <Flag size={15} />}
            Flag
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => setStatus("ACTIVE")}
          >
            {busy ? <Loader2 size={15} className="spin" /> : <RotateCcw size={15} />}
            Restore
          </button>
        )}
      </div>
    </div>
  );
}
