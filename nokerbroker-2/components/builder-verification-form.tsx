"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/image-uploader";
import { useToastManager } from "@/components/ui/toast";

export function BuilderVerificationForm() {
  const router = useRouter();
  const toasts = useToastManager();
  const [companyName, setCompanyName] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/builder-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, reraNumber, documentUrls }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not submit verification");
      toasts.add({ type: "success", title: "Verification submitted for admin review" });
      router.refresh();
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not submit verification" });
    } finally {
      setSubmitting(false);
    }
  }

  return <form onSubmit={submit} className="space-y-4">
    <div>
      <label className="block text-xs font-bold text-ink uppercase mb-1" htmlFor="company-name">Company / Developer Name</label>
      <input id="company-name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="w-full rounded-xl border border-border px-4 py-2 text-sm" required />
    </div>
    <div>
      <label className="block text-xs font-bold text-ink uppercase mb-1" htmlFor="rera-number">MahaRERA Registration Number</label>
      <input id="rera-number" value={reraNumber} onChange={(event) => setReraNumber(event.target.value.toUpperCase())} className="w-full rounded-xl border border-border px-4 py-2 text-sm" placeholder="P51700012345" required />
    </div>
    <div>
      <label className="block text-xs font-bold text-ink uppercase mb-2">RERA / company documents</label>
      <ImageUploader value={documentUrls} onChange={setDocumentUrls} label="Upload supporting documents" />
    </div>
    <button type="submit" className="btn btn-accent w-full" disabled={submitting || documentUrls.length === 0}>
      {submitting ? "Submitting…" : "Submit for admin review"}
    </button>
  </form>;
}
