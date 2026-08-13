// app/(authenticated)/compare/page.tsx
import React from "react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { serializeDocs } from "@/lib/serialize";

interface ComparableProperty {
  _id: string;
  title: string;
  price: number;
  locality: string;
  areaSqft: number;
  bhk?: number;
  amenities?: string[];
}

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids } = await searchParams;
  const propertyIds = ids ? ids.split(",").filter(Boolean).slice(0, 4) : [];

  let properties: ComparableProperty[] = [];
  if (propertyIds.length > 0) {
    await dbConnect();
    const rawProps = await Property.find({ _id: { $in: propertyIds }, status: "ACTIVE" }).lean();
    properties = serializeDocs(rawProps) as unknown as ComparableProperty[];
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink">Compare Properties</h1>
        <p className="text-sm text-ink-soft mt-1">
          Side-by-side comparison of prices, sqft area, amenities, and localities.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-ink-soft text-lg mb-4">No properties selected for comparison.</p>
          <Link href="/buy" className="btn btn-accent inline-block">
            Browse Properties to Compare
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-bg-warm">
                <th className="p-4 font-semibold text-ink text-sm w-48">Feature</th>
                {properties.map((p) => (
                  <th key={p._id} className="p-4 font-bold text-ink text-base min-w-[200px]">
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-ink-soft text-sm">Price</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4 font-bold text-orange text-lg">
                    ₹{p.price?.toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border bg-bg-warm/30">
                <td className="p-4 font-medium text-ink-soft text-sm">Locality</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4 text-ink text-sm">
                    {p.locality}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-ink-soft text-sm">Area (Sq. Ft.)</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4 text-ink text-sm">
                    {p.areaSqft} sq.ft
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border bg-bg-warm/30">
                <td className="p-4 font-medium text-ink-soft text-sm">BHK</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4 text-ink text-sm">
                    {p.bhk} BHK
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-ink-soft text-sm">Amenities</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4 text-ink text-xs space-y-1">
                    {p.amenities?.map((a: string) => (
                      <span key={a} className="inline-block bg-orange-pale text-orange px-2 py-0.5 rounded-full mr-1 mb-1 font-medium">
                        {a}
                      </span>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
