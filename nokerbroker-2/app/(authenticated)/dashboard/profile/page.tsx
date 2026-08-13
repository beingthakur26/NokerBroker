import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your NokerBroker account details.",
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user!.id;

  let user: { name?: string; email?: string; whatsappNumber?: string; whatsappVerified?: boolean; role?: string; city?: string; locality?: string } | null = null;
  try {
    await dbConnect();
    user = await User.findById(userId).lean();
  } catch (error) {
    console.error("[profile] Failed to load user:", error);
  }

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Profile
          </h1>
        </div>
      </div>

      <div className="dash-profile" style={{ marginBottom: 24 }}>
        <span className="dash-avatar">{user?.name?.charAt(0)?.toUpperCase() ?? "N"}</span>
        <div>
          <p className="dash-name">
            {user?.name}
            <span className="dash-verified">
              {user?.role === "ADMIN" ? "Admin" : user?.whatsappVerified ? "WhatsApp verified" : "User"}
            </span>
          </p>
          <p className="dash-meta">
            {user?.email} · {user?.whatsappNumber}
          </p>
        </div>
      </div>

      <ProfileForm
        initial={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          whatsappNumber: user?.whatsappNumber ?? "",
          city: user?.city ?? "",
          locality: user?.locality ?? "",
        }}
      />
    </div>
  );
}
