// app/(authenticated)/dashboard/listings/[id]/edit/page.tsx
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { ListingForm } from "@/components/listing-form";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  await dbConnect();
  const property = await Property.findOne({ _id: id, ownerId: session.user.id }).lean();

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-ink">Listing Not Found</h2>
        <p className="text-sm text-ink-soft mt-2">You do not have permission to edit this listing.</p>
        <Link href="/dashboard/listings" className="mt-4 btn btn-accent inline-block">
          Back to My Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Edit Property Listing</h1>
        <p className="text-sm text-ink-soft">Update details for {property.title}</p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <ListingForm initialData={JSON.parse(JSON.stringify(property))} />
      </div>
    </div>
  );
}
