"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NotificationActions({ unread }: { unread: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!unread) return null;
  return <button className="btn btn-ghost" type="button" disabled={busy} onClick={async () => { setBusy(true); try { const response = await fetch("/api/notifications", { method: "PATCH" }); if (!response.ok) throw new Error(); router.refresh(); } finally { setBusy(false); } }}>{busy ? "Updating…" : "Mark all read"}</button>;
}
