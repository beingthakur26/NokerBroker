// app/(authenticated)/dashboard/bookings/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Project from "@/models/Project";
import { BookingStatusTracker } from "@/components/booking-status-tracker";
import { serializeDocs } from "@/lib/serialize";

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const rawBookings = await Booking.find({ userId: session.user.id })
    .populate({ path: "projectId", model: Project, select: "name locality" })
    .sort({ createdAt: -1 })
    .lean();

  const bookings = serializeDocs(rawBookings);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">My Token Bookings</h1>
        <p className="text-sm text-ink-soft">Track the status of your advance unit bookings and site visits.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-ink-soft">You have no active token bookings or site visits.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking: any) => (
            <BookingStatusTracker
              key={booking._id}
              status={booking.status}
              tokenAmount={booking.tokenAmount}
              paymentRef={booking.paymentRef}
              projectName={booking.projectId?.name || "Project Unit"}
              unitType="Standard Unit"
            />
          ))}
        </div>
      )}
    </div>
  );
}
