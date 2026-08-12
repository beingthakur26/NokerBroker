// app/(authenticated)/loans/eligibility/page.tsx
import React from "react";
import Link from "next/link";
import { EmiCalculatorWidget } from "@/components/emi-calculator-widget";

export default function LoanEligibilityPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-ink">Home Loan Eligibility Checker</h1>
        <p className="text-sm text-ink-soft mt-1">
          Calculate your maximum loan capacity based on your monthly income and tenure.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <EmiCalculatorWidget />
      </div>

      <div className="mt-8 text-center">
        <Link href="/loans" className="btn btn-accent inline-block">
          Apply For Home Loan Now
        </Link>
      </div>
    </main>
  );
}
