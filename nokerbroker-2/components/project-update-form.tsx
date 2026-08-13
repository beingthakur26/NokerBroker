"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/image-uploader";
import { useToastManager } from "@/components/ui/toast";

export function ProjectUpdateForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const toasts = useToastManager();
  const [month, setMonth] = useState("");
  const [note, setNote] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, note, imageUrls }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not publish update");
      setMonth(""); setNote(""); setImageUrls([]);
      toasts.add({ type: "success", title: "Construction update published" });
      router.refresh();
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not publish update" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="listing-form" style={{ marginTop: 20 }}>
      <div className="search-field form-field"><label htmlFor="update-month">Update month</label><input id="update-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} required /></div>
      <div className="search-field form-field"><label htmlFor="update-note">Progress note</label><textarea id="update-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} /></div>
      <div className="form-field"><label>Progress photos</label><ImageUploader value={imageUrls} onChange={setImageUrls} label="Upload photos" /></div>
      <button className="btn btn-primary" type="submit" disabled={saving || (!note.trim() && imageUrls.length === 0)}>{saving ? "Publishing…" : "Publish update"}</button>
    </form>
  );
}
