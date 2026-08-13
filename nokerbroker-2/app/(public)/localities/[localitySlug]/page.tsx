// app/(public)/localities/[localitySlug]/page.tsx
import React from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { toPropertyView } from "@/lib/serialize";
import type { PropertyView } from "@/lib/serialize";

interface LocalityPageProps {
  params: Promise<{ localitySlug: string }>;
}

export default async function LocalityPage({ params }: LocalityPageProps) {
  const { localitySlug } = await params;
  const decodedLocality = decodeURIComponent(localitySlug).replace(/-/g, " ");

  await dbConnect();
  const rawProperties = await Property.find({
    locality: { $regex: new RegExp(decodedLocality, "i") },
    status: "ACTIVE",
  })
    .sort({ createdAt: -1 })
    .lean();

  const properties: PropertyView[] = rawProperties.map((property) => toPropertyView(property));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-ink capitalize">
          Properties in {decodedLocality}
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Explore real estate listings, resale flats, and new projects in {decodedLocality}, Mumbai.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-ink-soft text-lg">No active properties found in {decodedLocality} at the moment.</p>
          <Link href="/buy" className="mt-4 inline-block btn btn-accent">
            Browse All Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} detailsHref={`/buy/${property.slug}`} />
          ))}
        </div>
      )}
    </main>
  );
}
