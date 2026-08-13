"use client";

import { useState } from "react";
import Link from "next/link";
import type { InquiryView } from "@/lib/serialize";

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
              ? "Our team manages the response to enquiries about your listings and projects."
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
                    <span>Our team will review and respond to this enquiry.</span>
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
