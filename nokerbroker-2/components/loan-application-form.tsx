"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToastManager } from "@/components/ui/toast";

export function LoanApplicationForm() {
  const router = useRouter();
  const toasts = useToastManager();
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(values)) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not submit application");
      event.currentTarget.reset();
      toasts.add({ type: "success", title: "Loan application submitted" });
      router.refresh();
    } catch (error) { toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not submit application" }); }
    finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-3">
    <h2 className="font-bold text-ink">Apply for a home loan</h2>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <input className="rounded-xl border border-border px-3 py-2 text-sm" name="loanAmount" inputMode="numeric" placeholder="Loan amount (₹)" required />
      <input className="rounded-xl border border-border px-3 py-2 text-sm" name="monthlyIncome" inputMode="numeric" placeholder="Monthly income (₹)" required />
      <input className="rounded-xl border border-border px-3 py-2 text-sm" name="tenureYears" type="number" min="1" max="30" placeholder="Tenure (years)" required />
      <input className="rounded-xl border border-border px-3 py-2 text-sm" name="interestRate" type="number" min="1" max="30" step="0.1" defaultValue="8.5" placeholder="Interest rate (%)" required />
      <select className="rounded-xl border border-border px-3 py-2 text-sm" name="employmentType" defaultValue="" required><option value="" disabled>Employment type</option><option value="SALARIED">Salaried</option><option value="SELF_EMPLOYED">Self-employed</option><option value="OTHER">Other</option></select>
      <input className="rounded-xl border border-border px-3 py-2 text-sm" name="existingLoans" inputMode="numeric" defaultValue="0" placeholder="Existing monthly EMIs (₹)" required />
      <input className="rounded-xl border border-border px-3 py-2 text-sm md:col-span-2" name="panNumber" maxLength={10} placeholder="PAN number" required />
    </div>
    <p className="text-xs text-ink-soft">Do not upload sensitive documents here. A verified lender will request them through a secure channel after review.</p>
    <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit application"}</button>
  </form>;
}
