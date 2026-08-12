"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import type { InquiryView } from "@/lib/serialize";
import { useToastManager } from "@/components/ui/toast";

interface InquiriesListProps {
  received: InquiryView[];
  sent: InquiryView[];
}

function targetOf(inquiry: InquiryView): { label: string; href?: string } {
  if (inquiry.propertyTitle) {
    return { label: inquiry.propertyTitle, href: inquiry.propertySlug ? `/buy/${inquiry.propertySlug}` : undefined };
  }
  if (inquiry.projectName) {
    return { label: inquiry.projectName, href: inquiry.projectSlug ? `/projects/${inquiry.projectSlug}` : undefined };
  }
  return { label: "Listing" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InquiriesList({ received, sent }: InquiriesListProps) {
  const [tab, setTab] = useState<"received" | "sent">(received.length > 0 ? "received" : "sent");

  const rows = tab === "received" ? received : sent;

  return (
    <div>
      <div className="seg" role="tablist" aria-label="Inquiry type">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "received"}
          className={tab === "received" ? "active" : undefined}
          onClick={() => setTab("received")}
        >
          Received ({received.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "sent"}
          className={tab === "sent" ? "active" : undefined}
          onClick={() => setTab("sent")}
        >
          Sent ({sent.length})
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <h2>{tab === "received" ? "No enquiries received yet" : "No enquiries sent yet"}</h2>
          <p>
            {tab === "received"
              ? "When buyers enquire about your listings or projects, they appear here with full contact details."
              : "Send an enquiry from any listing to track it here."}
          </p>
        </div>
      ) : (
        <div className="inq-list">
          {rows.map((inquiry) => {
            const target = targetOf(inquiry);
            return (
              <div className="inq-card" key={inquiry._id}>
                <div className="inq-head">
                  <div>
                    <b>{tab === "received" ? inquiry.senderName || "Anonymous" : target.label}</b>
                    <span className="inq-target">
                      {tab === "sent" && target.href ? <Link href={target.href}>{target.label}</Link> : target.label}
                    </span>
                  </div>
                  <div className="inq-meta">
                    <span className={`status status-${inquiry.status.toLowerCase()}`}>{inquiry.status}</span>
                    <span>{formatDate(inquiry.createdAt)}</span>
                  </div>
                </div>
                <p className="inq-msg">{inquiry.message}</p>
                <div className="inq-foot">
                  <span>Prefers: {inquiry.contactMode}</span>
                  {tab === "received" ? (
                    <div className="inq-cta">
                      {inquiry.senderWhatsapp && (
                        <a
                          className="btn btn-whatsapp"
                          href={`https://wa.me/${inquiry.senderWhatsapp.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>
                      )}
                      {inquiry.senderEmail && (
                        <a className="btn btn-ghost" href={`mailto:${inquiry.senderEmail}`}>
                          <Phone size={14} />
                          Email
                        </a>
                      )}
                      <MarkResponded id={inquiry._id} status={inquiry.status} />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MarkResponded({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const toasts = useToastManager();
  const [busy, setBusy] = useState(false);

  if (status === "CLOSED") return null;

  async function update(next: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Update failed");
      toasts.add({ type: "success", title: next === "RESPONDED" ? "Marked as responded" : "Enquiry closed" });
      router.refresh();
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Update failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => update("RESPONDED")}>
        {status === "OPEN" ? "Mark responded" : "Reopen"}
      </button>
      <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => update("CLOSED")}>
        Close
      </button>
    </>
  );
}
