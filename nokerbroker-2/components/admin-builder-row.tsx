"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToastManager } from "@/components/ui/toast";

export function AdminBuilderRow({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const toasts = useToastManager();
  const [busy, setBusy] = useState(false);
  async function review(next: "VERIFIED" | "DENIED") {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/builders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not review builder");
      toasts.add({ type: "success", title: next === "VERIFIED" ? "Builder approved" : "Builder denied" });
      router.refresh();
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not review builder" });
    } finally { setBusy(false); }
  }
  if (status !== "PENDING") return null;
  return <div className="flex gap-2"><button type="button" className="btn btn-primary" disabled={busy} onClick={() => review("VERIFIED")}>Approve</button><button type="button" className="btn btn-ghost danger" disabled={busy} onClick={() => review("DENIED")}>Deny</button></div>;
}
