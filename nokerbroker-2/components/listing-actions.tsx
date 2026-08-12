"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, CheckCheck, Trash2 } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";

interface ListingActionsProps {
  id: string;
  status: string;
}

export function ListingActions({ id, status }: ListingActionsProps) {
  const router = useRouter();
  const toasts = useToastManager();
  const [busy, setBusy] = useState(false);

  async function update(action: "pause" | "activate" | "sold" | "delete") {
    setBusy(true);
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body:
          action === "delete"
            ? undefined
            : JSON.stringify({
                status:
                  action === "pause"
                    ? "DRAFT"
                    : action === "activate"
                      ? "ACTIVE"
                      : "SOLD",
              }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      toasts.add({
        type: "success",
        title:
          action === "delete"
            ? "Listing deleted"
            : action === "pause"
              ? "Listing paused"
              : action === "sold"
                ? "Marked as sold"
                : "Listing is live again",
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
    <div className="listing-actions">
      {status === "ACTIVE" ? (
        <>
          <button type="button" disabled={busy} onClick={() => update("pause")} title="Pause listing">
            <Pause size={15} />
            Pause
          </button>
          <button type="button" disabled={busy} onClick={() => update("sold")} title="Mark as sold">
            <CheckCheck size={15} />
            Sold
          </button>
        </>
      ) : (
        <button type="button" disabled={busy} onClick={() => update("activate")} title="Republish listing">
          <Play size={15} />
          Republish
        </button>
      )}
      <button type="button" disabled={busy} onClick={() => update("delete")} title="Delete listing" className="danger">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
