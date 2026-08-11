import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Heart, MessagesSquare } from "lucide-react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your NokerBroker account — saved homes, inquiries, and listings.",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");

  const name = session.user.name ?? "there";
  const initial = name.trim().charAt(0).toUpperCase() || "N";

  return (
    <main className="section">
      <div className="wrap">
        <p className="eyebrow">NokerBroker dashboard</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, margin: "8px 0 28px" }}>
          Welcome back, {name.split(" ")[0]}
        </h1>

        <div className="dash-profile">
          <span className="dash-avatar">{initial}</span>
          <div>
            <p className="dash-name">
              {name}
              <span className="dash-verified">WhatsApp verified</span>
            </p>
            <p className="dash-meta">{session.user.email}</p>
          </div>
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <Heart size={18} />
            <strong>0</strong>
            <span>Saved homes</span>
          </div>
          <div className="dash-stat">
            <MessagesSquare size={18} />
            <strong>0</strong>
            <span>Inquiries</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-dot" />
            <strong>0</strong>
            <span>Active listings</span>
          </div>
        </div>

        <div className="dash-actions">
          <Link className="dash-action" href="/buy">
            <div>
              <strong>Browse homes</strong>
              <span>Shortlist flats &amp; houses across the city.</span>
            </div>
            <ArrowRight size={18} />
          </Link>
          <Link className="dash-action" href="/emi-calculator">
            <div>
              <strong>EMI calculator</strong>
              <span>Work out your monthly payment before you visit.</span>
            </div>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="dash-note">
          Saved-home shortlisting is coming soon — your shortlist will live here.
        </div>
      </div>
    </main>
  );
}
