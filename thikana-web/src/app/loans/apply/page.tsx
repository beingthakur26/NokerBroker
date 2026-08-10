"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "../../../lib/useSession";
import { Button } from "../../../components/ui/Button";
import { apiPost } from "../../../lib/api-client";

function LoanApplyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useSession();

  const priceParam = Number(params.get("price") || 0);
  const amountParam = Number(params.get("amount") || 0);

  const [propertyPrice, setPropertyPrice] = useState(priceParam || amountParam || 6000000);
  const [loanAmount, setLoanAmount] = useState(
    amountParam || (priceParam ? Math.round(priceParam * 0.8) : 5000000)
  );
  const [tenureYears, setTenureYears] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [monthlyIncome, setMonthlyIncome] = useState(120000);
  const [employmentType, setEmploymentType] = useState<"SALARIED" | "SELF_EMPLOYED" | "BUSINESS">("SALARIED");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading) return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  if (!user) return <p className="text-center mt-20 text-ink-soft">Redirecting...</p>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiPost("/me/loans/apply", {
        propertyPrice,
        loanAmount,
        tenureYears,
        interestRate,
        monthlyIncome,
        employmentType,
      });
      router.push("/dashboard/buyer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit the application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Home loan</span>
      <h1 className="font-display text-3xl text-ink mt-2">Apply for a home loan</h1>
      <p className="text-sm text-ink-soft mt-2">
        Fill in your details — our partner banks will reach out. Track your application from your dashboard.
      </p>
      {priceParam > 0 && (
        <p className="mt-4 text-xs font-mono text-orange-deep bg-orange-pale inline-block px-3 py-1.5 rounded-full">
          Pre-filled from property price ₹{propertyPrice.toLocaleString("en-IN")}
        </p>
      )}

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-border rounded-xl2 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Property price (₹)</label>
            <input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))} className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Loan amount (₹)</label>
            <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Tenure (years)</label>
            <input type="number" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Interest rate (% p.a.)</label>
            <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Monthly income (₹)</label>
            <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink block mb-1.5">Employment type</label>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)} className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm">
              <option value="SALARIED">Salaried</option>
              <option value="SELF_EMPLOYED">Self-employed</option>
              <option value="BUSINESS">Business owner</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="accent" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
          <Link href="/emi-calculator">
            <Button type="button" variant="outline">Use EMI calculator first</Button>
          </Link>
        </div>
      </form>
    </main>
  );
}

export default function LoanApplyPage() {
  return (
    <Suspense fallback={<p className="text-center mt-20 text-ink-soft">Loading...</p>}>
      <LoanApplyForm />
    </Suspense>
  );
}
