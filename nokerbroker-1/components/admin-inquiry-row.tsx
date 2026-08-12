"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, RotateCcw, X, Phone, MessageCircle, Loader2 } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";

interface AdminInquiryRowProps {
  id: string;
  senderName: string;
  senderEmail: string;
  senderWhatsapp: string;
  propertyTitle?: string;
  propertySlug?: string;
  projectName?: string;
  projectSlug?: string;
  message: string;
  contactMode: string;
  status: string;
  createdAt: string;
}

export function AdminInquiryRow({
  id,
  senderName,
  senderEmail,
  senderWhatsapp,
  propertyTitle,
  propertySlug,
  projectName,
  projectSlug,
  message,
  contactMode,
  status,
  createdAt,
}: AdminInquiryRowProps) {
  const router = useRouter();
  const toasts = useToastManager();
  const [busy, setBusy] = useState(false);
  const target = propertyTitle ?? projectName ?? "Unknown listing";
  const targetHref = propertySlug ? `/buy/${propertySlug}` : projectSlug ? `/projects/${projectSlug}` : undefined;
  const whatsappHref = senderWhatsapp
    ? `https://wa.me/${senderWhatsapp.replace(/[^\d]/g, "")}`
    : undefined;

  async function setStatus(next: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      toasts.add({
        type: "success",
        title: next === "CLOSED" ? "Inquiry closed" : next === "OPEN" ? "Inquiry reopened" : "Marked as responded",
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
    <div className="inq-card">
      <div className="inq-head">
        <div>
          <b>{senderName}</b>
          {senderEmail && <span className="inq-meta">{senderEmail}</span>}
          {senderWhatsapp && <span className="inq-meta">{senderWhatsapp}</span>}
        </div>
        <div className="inq-foot" style={{ border: 0 }}>
          {whatsappHref && (
            <a className="btn btn-ghost" href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          <a className="btn btn-ghost" href={`tel:${senderWhatsapp}`}>
            <Phone size={15} /> Call
          </a>
        </div>
      </div>

      {targetHref ? (
        <Link className="inq-target" href={targetHref}>{target} →</Link>
      ) : (
        <div className="inq-target">{target}</div>
      )}

      <p className="inq-msg">{message}</p>

      <div className="inq-foot">
        <div className="inq-meta">
          <span>{new Date(createdAt).toLocaleString("en-IN")}</span>
          <span>{contactMode}</span>
          <span className={`status status-${status.toLowerCase()}`}>{status}</span>
        </div>
        <div className="inq-cta">
          {status !== "RESPONDED" && (
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setStatus("RESPONDED")}>
              {busy ? <Loader2 size={15} className="spin" /> : <CheckCheck size={15} />}
              Responded
            </button>
          )}
          {status === "CLOSED" ? (
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setStatus("OPEN")}>
              {busy ? <Loader2 size={15} className="spin" /> : <RotateCcw size={15} />}
              Reopen
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setStatus("CLOSED")}>
              {busy ? <Loader2 size={15} className="spin" /> : <X size={15} />}
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
