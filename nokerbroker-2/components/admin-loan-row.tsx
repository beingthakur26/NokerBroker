"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastManager } from "@/components/ui/toast";

const statuses = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"];

export function AdminLoanRow({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const toasts = useToastManager();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  return <div className="flex items-center gap-2"><select className="rounded border border-border px-2 py-1 text-xs" value={value} onChange={(event) => setValue(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><button className="btn btn-ghost" type="button" disabled={busy || value === status} onClick={async () => { setBusy(true); try { const response = await fetch(`/api/admin/loans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: value }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Could not update loan"); toasts.add({ type: "success", title: "Loan status updated" }); router.refresh(); } catch (error) { toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not update loan" }); } finally { setBusy(false); } }}>{busy ? "Saving…" : "Save"}</button></div>;
}
