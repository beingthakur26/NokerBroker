import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, MessagesSquare, Building2, Blocks } from "lucide-react";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import Inquiry from "@/models/Inquiry";
import { getPropertiesByOwner } from "@/lib/properties-db";
import { getProjectsByBuilder } from "@/lib/projects-db";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your NokerBroker account — saved homes, listings, projects and inquiries.",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  let favorites = 0, inquiries = 0, properties: any[] = [], projects: any[] = [];
  try {
    await dbConnect();
    [favorites, inquiries, properties, projects] = await Promise.all([
      Favorite.countDocuments({ userId }),
      Inquiry.countDocuments({ senderId: userId }),
      getPropertiesByOwner(userId),
      getProjectsByBuilder(userId),
    ]);
  } catch (error) {
    console.error("[dashboard] Failed to load stats:", error);
  }

  const name = session!.user!.name ?? "there";
  const initial = name.trim().charAt(0).toUpperCase() || "N";
  const activeListings = properties.filter((property: any) => property.status === "ACTIVE");

  return (
    <div>
      <p className="eyebrow">NokerBroker dashboard</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "8px 0 24px" }}>
        Welcome back, {name.split(" ")[0]}
      </h1>

      <div className="dash-profile">
        <span className="dash-avatar">{initial}</span>
        <div>
          <p className="dash-name">
            {name}
            <span className="dash-verified">WhatsApp verified</span>
          </p>
          <p className="dash-meta">{session!.user!.email}</p>
        </div>
      </div>

      <div className="dash-stats">
        <Link className="dash-stat" href="/dashboard/favorites">
          <Heart size={18} />
          <strong>{favorites}</strong>
          <span>Saved homes</span>
        </Link>
        <Link className="dash-stat" href="/dashboard/inquiries">
          <MessagesSquare size={18} />
          <strong>{inquiries}</strong>
          <span>Enquiries sent</span>
        </Link>
        <Link className="dash-stat" href="/dashboard/listings">
          <Building2 size={18} />
          <strong>{activeListings.length}</strong>
          <span>Active listings</span>
        </Link>
        <Link className="dash-stat" href="/dashboard/projects">
          <Blocks size={18} />
          <strong>{projects.length}</strong>
          <span>Projects</span>
        </Link>
      </div>

      <div className="dash-actions">
        <Link className="dash-action" href="/list-property">
          <div>
            <strong>Sell your property</strong>
            <span>List a flat or house — live immediately, zero brokerage.</span>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link className="dash-action" href="/dashboard/projects/new">
          <div>
            <strong>List a new project</strong>
            <span>Add a RERA-verified project with unit configurations.</span>
          </div>
          <ArrowRight size={18} />
        </Link>
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

      {inquiries === 0 && favorites === 0 && activeListings.length === 0 && (
        <div className="dash-note">
          Get started: browse verified homes on <Link className="link-more" href="/buy">/buy</Link> and save the
          ones you like, or list your own property to start receiving enquiries.
        </div>
      )}
    </div>
  );
}
