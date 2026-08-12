// app/(authenticated)/list-property/page.tsx
import React from "react";
import { ListingForm } from "@/components/listing-form";

export default function ListPropertyPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-ink">List Your Resale Property</h1>
        <p className="text-ink-soft text-sm mt-1">
          Zero brokerage. Get verified buyers directly on WhatsApp.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <ListingForm />
      </div>
    </main>
  );
}
