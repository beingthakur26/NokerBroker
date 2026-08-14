"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { budgetBuckets } from "@/lib/properties";
import { useToastManager } from "@/components/ui/toast";

type Search = { _id: string; title: string; alertsOn: boolean; createdAt: string };

export function SavedSearchManager({ searches }: { searches: Search[] }) {
  const router = useRouter();
  const toasts = useToastManager();
  const [title, setTitle] = useState("");
  const [locality, setLocality] = useState("");
  const [budget, setBudget] = useState("");
  const [bhk, setBhk] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function request(path: string, options: RequestInit) {
    const response = await fetch(path, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Could not update saved search");
    router.refresh();
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    setBusy("create");
    try {
      await request("/api/saved-searches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, filters: { locality, budget, bhk } }) });
      setTitle(""); setLocality(""); setBudget(""); setBhk("");
      toasts.add({ type: "success", title: "Saved search created" });
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not create saved search" });
    } finally { setBusy(null); }
  }

  async function update(id: string, alertsOn: boolean) {
    setBusy(id);
    try {
      await request(`/api/saved-searches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alertsOn }) });
    } catch (error) { toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not update saved search" }); }
    finally { setBusy(null); }
  }

  async function remove(id: string) {
    setBusy(id);
    try { await request(`/api/saved-searches/${id}`, { method: "DELETE" }); }
    catch (error) { toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not delete saved search" }); }
    finally { setBusy(null); }
  }

  return <div className="space-y-6">
    <form onSubmit={create} className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-3">
      <h2 className="font-bold text-ink">Create a saved search</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-border px-3 py-2 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. 2 BHK in Powai" aria-label="Saved search name" required />
        <input className="rounded-xl border border-border px-3 py-2 text-sm" value={locality} onChange={(event) => setLocality(event.target.value)} placeholder="Locality (optional)" aria-label="Locality" />
        <select className="rounded-xl border border-border px-3 py-2 text-sm" value={budget} onChange={(event) => setBudget(event.target.value)} aria-label="Budget"><option value="">Any budget</option>{budgetBuckets.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select className="rounded-xl border border-border px-3 py-2 text-sm" value={bhk} onChange={(event) => setBhk(event.target.value)} aria-label="BHK"><option value="">Any BHK</option><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4+ BHK</option></select>
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy === "create"}>{busy === "create" ? "Saving…" : "Save search"}</button>
    </form>
    {searches.length > 0 && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{searches.map((search) => <div key={search._id} className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-3"><h3 className="font-bold text-ink">{search.title}</h3><p className="text-xs text-ink-soft">Saved {new Date(search.createdAt).toLocaleDateString()}</p><div className="flex gap-2"><button className="btn btn-ghost" type="button" disabled={busy === search._id} onClick={() => update(search._id, !search.alertsOn)}>{search.alertsOn ? "Pause alerts" : "Enable alerts"}</button><button className="btn btn-ghost danger" type="button" disabled={busy === search._id} onClick={() => remove(search._id)}>Delete</button></div></div>)}</div>}
  </div>;
}
