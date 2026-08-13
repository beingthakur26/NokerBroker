// app/(authenticated)/dashboard/notifications/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { serializeDocs } from "@/lib/serialize";

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const rawNotifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const notifications = serializeDocs(rawNotifications) as unknown as NotificationItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Notifications Center</h1>
        <p className="text-sm text-ink-soft">Updates on your listings, loan applications, and inquiries.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-ink-soft">You have no new notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif._id} className={`rounded-xl border p-4 shadow-sm ${notif.read ? "bg-white border-border" : "bg-orange-pale/30 border-orange-glow"}`}>
              <div className="flex items-center justify-between text-xs text-ink-soft mb-1">
                <span className="font-bold text-orange uppercase tracking-wider">{notif.type}</span>
                <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-ink font-medium">{notif.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
