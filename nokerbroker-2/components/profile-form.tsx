"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToastManager } from "@/components/ui/toast";

interface ProfileFormProps {
  initial: { name: string; city: string; locality: string };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const toasts = useToastManager();
  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city ?? "");
  const [locality, setLocality] = useState(initial.locality ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), city, locality }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save profile");
      toasts.add({ type: "success", title: "Profile updated" });
      router.refresh();
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not save profile" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="listing-form">
      <div className="form-grid">
        <div className="search-field form-field">
          <label htmlFor="pf-name">Name</label>
          <input id="pf-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="search-field form-field">
          <label htmlFor="pf-city">City</label>
          <input id="pf-city" value={city} onChange={(event) => setCity(event.target.value)} />
        </div>
        <div className="search-field form-field">
          <label htmlFor="pf-locality">Locality</label>
          <input id="pf-locality" value={locality} onChange={(event) => setLocality(event.target.value)} />
        </div>
      </div>
      <div className="wizard-nav">
        <button className="btn btn-primary" type="submit" disabled={saving || !name.trim()}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
