"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, User as UserIcon, Loader2 } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";

interface AdminUserRowProps {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  whatsappVerified: boolean;
  role: string;
  city?: string;
  createdAt: string;
  self: boolean;
}

export function AdminUserRow({
  id,
  name,
  email,
  whatsappNumber,
  whatsappVerified,
  role,
  city,
  createdAt,
  self,
}: AdminUserRowProps) {
  const router = useRouter();
  const toasts = useToastManager();
  const [busy, setBusy] = useState(false);
  const isAdmin = role === "ADMIN";

  async function toggleRole() {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: isAdmin ? "USER" : "ADMIN" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      toasts.add({
        type: "success",
        title: isAdmin ? "Removed admin access" : "Promoted to admin",
      });
      router.refresh();
    } catch (error) {
      toasts.add({
        type: "error",
        title: error instanceof Error ? error.message : "Action failed",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash-list-row">
      <div className="dash-list-main">
        <div className="dash-list-title">
          {name}
          {self && <span className="status status-active">You</span>}
        </div>
        <div className="dash-list-meta">
          <span>{email}</span>
          <span>{whatsappNumber}</span>
          <span>{whatsappVerified ? "WhatsApp verified" : "WhatsApp unverified"}</span>
          {city && <span>{city}</span>}
          <span>Joined {new Date(createdAt).toLocaleDateString("en-IN")}</span>
        </div>
      </div>
      <div className="dash-list-actions">
        <span className={`status ${isAdmin ? "status-flagged" : "status-draft"}`}>
          {isAdmin ? "Admin" : "User"}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy || self}
          onClick={toggleRole}
          title={self ? "You cannot change your own role" : isAdmin ? "Demote to user" : "Promote to admin"}
        >
          {busy ? <Loader2 size={15} className="spin" /> : isAdmin ? <UserIcon size={15} /> : <Shield size={15} />}
          {isAdmin ? "Demote" : "Make admin"}
        </button>
      </div>
    </div>
  );
}
