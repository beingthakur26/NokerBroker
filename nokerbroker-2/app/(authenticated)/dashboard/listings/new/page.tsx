import type { Metadata } from "next";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = {
  title: "List a property",
  description: "List your flat, house or plot — live immediately, zero brokerage.",
};

export default function ListPropertyPage() {
  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            List a property
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            Goes live the moment you publish — no approval queue, no brokerage.
          </p>
        </div>
      </div>
      <ListingForm />
    </div>
  );
}
