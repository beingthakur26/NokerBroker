"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToastManager } from "@/components/ui/toast";

interface EnquiryDialogProps {
  slug: string;
  kind?: "property" | "project";
  nextPath: string;
  listingLabel: string;
  ownerName: string;
  ownerWhatsapp: string;
  waText: string;
}

const CONTACT_MODES = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "CALL", label: "Phone call" },
  { value: "BOTH", label: "WhatsApp + call" },
  { value: "CHAT", label: "Email / in-app" },
];

export function EnquiryDialog({
  slug,
  kind = "property",
  nextPath,
  listingLabel,
  ownerName,
  ownerWhatsapp,
  waText,
}: EnquiryDialogProps) {
  const { status } = useSession();
  const router = useRouter();
  const toasts = useToastManager();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [contactMode, setContactMode] = useState("WHATSAPP");
  const [submitting, setSubmitting] = useState(false);

  function recordInquiry(payload: { message: string; contactMode: string }) {
    if (status !== "authenticated") return;
    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertySlug: kind === "property" ? slug : undefined,
        projectSlug: kind === "project" ? slug : undefined,
        ...payload,
      }),
    }).catch(() => undefined);
  }

  function openWhatsApp() {
    recordInquiry({ message: `Hi ${ownerName}, I'm interested in ${listingLabel} on NokerBroker. Could we talk?`, contactMode: "WHATSAPP" });
    window.open(`https://wa.me/${ownerWhatsapp}?text=${encodeURIComponent(waText)}`, "_blank", "noopener,noreferrer");
  }

  async function submitEnquiry(event: FormEvent) {
    event.preventDefault();
    if (status !== "authenticated") {
      router.push(`/login?next=${nextPath}`);
      return;
    }
    if (!message.trim()) {
      toasts.add({ type: "error", title: "Add a short message to send your enquiry" });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertySlug: kind === "property" ? slug : undefined,
          projectSlug: kind === "project" ? slug : undefined,
          message: message.trim(),
          contactMode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      setOpen(false);
      setMessage("");
      toasts.add({ type: "success", title: "Enquiry sent — the owner will get back to you" });
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not send enquiry" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="enquiry-actions">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button className="btn btn-primary" type="button">
              <MessageSquare size={16} />
              Enquire
            </button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send an enquiry</DialogTitle>
            <DialogDescription>
              Your message goes straight to the owner. They&apos;ll see your name and contact number.
            </DialogDescription>
          </DialogHeader>

          {status === "authenticated" ? (
            <form onSubmit={submitEnquiry} className="enquiry-form">
              <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
                <label htmlFor="enquiry-message">Message</label>
                <textarea
                  id="enquiry-message"
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Hi, is this still available? I'd like to visit this weekend."
                  required
                />
              </div>
              <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 16 }}>
                <label htmlFor="enquiry-mode">How should the owner reach you?</label>
                <select
                  id="enquiry-mode"
                  value={contactMode}
                  onChange={(event) => setContactMode(event.target.value)}
                >
                  {CONTACT_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          ) : (
            <div className="enquiry-form">
              <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 16 }}>
                Log in so the owner knows who is enquiring — your enquiry will be saved to your dashboard.
              </p>
              <Link
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                href={`/login?next=${nextPath}`}
              >
                Log in to send an enquiry
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <button className="btn btn-whatsapp" type="button" onClick={openWhatsApp}>
        <MessageCircle size={16} />
        WhatsApp {kind === "project" ? "builder" : "owner"}
      </button>
    </div>
  );
}
