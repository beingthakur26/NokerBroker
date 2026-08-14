"use client";

import { useState } from "react";
import { Bell, Mail, MonitorSmartphone } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";

type Preference = "IN_APP" | "EMAIL" | "BOTH";

export function NotificationPreferences({ initial }: { initial: { inApp?: boolean; email?: boolean } }) {
  const toasts = useToastManager();
  const initialValue: Preference = initial.inApp === false ? "EMAIL" : initial.email === false ? "IN_APP" : "BOTH";
  const [value, setValue] = useState<Preference>(initialValue);
  const [saving, setSaving] = useState(false);

  async function update(next: Preference) {
    setValue(next);
    setSaving(true);
    const preferences = { inApp: next !== "EMAIL", email: next !== "IN_APP" };
    try {
      const response = await fetch("/api/notification-preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(preferences) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save preferences");
      toasts.add({ type: "success", title: "Notification preferences saved" });
    } catch (error) {
      setValue(initialValue);
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not save preferences" });
    } finally {
      setSaving(false);
    }
  }

  return <section className="notify-preferences" aria-labelledby="notification-preferences-title">
    <div><p className="eyebrow">Account</p><h2 id="notification-preferences-title">Notification delivery</h2><p>Choose where you want marketplace and security updates delivered.</p></div>
    <div className="notify-options" role="radiogroup" aria-label="Notification delivery preference">
      {[
        ["IN_APP", MonitorSmartphone, "In-app only", "See updates when you are signed in."],
        ["EMAIL", Mail, "Email only", "Receive updates in your inbox."],
        ["BOTH", Bell, "In-app and email", "Keep an in-app history and get email delivery."],
      ].map(([key, Icon, label, description]) => <button key={key as string} type="button" className={value === key ? "active" : undefined} role="radio" aria-checked={value === key} disabled={saving} onClick={() => void update(key as Preference)}><Icon size={18} /><span><b>{label as string}</b><small>{description as string}</small></span></button>)}
    </div>
  </section>;
}
