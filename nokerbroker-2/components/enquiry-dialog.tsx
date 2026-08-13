"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToastManager } from "@/components/ui/toast";

interface EnquiryDialogProps {
  slug: string;
  kind?: "property" | "project";
  nextPath: string;
  listingLabel: string;
}

const CONTACT_MODES = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "CALL", label: "Phone call" },
  { value: "BOTH", label: "WhatsApp + call" },
];

export function EnquiryDialog({ slug, kind = "property", nextPath, listingLabel }: EnquiryDialogProps) {
  const { status } = useSession();
  const router = useRouter();
  const toasts = useToastManager();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [contactMode, setContactMode] = useState("WHATSAPP");
  const [submitting, setSubmitting] = useState(false);

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
      toasts.add({ type: "success", title: "Enquiry sent — our team will contact you by phone or WhatsApp" });
    } catch (error) {
      toasts.add({ type: "error", title: error instanceof Error ? error.message : "Could not send enquiry" });
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="enquiry-actions">
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="btn btn-primary" type="button"><MessageSquare size={16} />Enquire</button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enquire about {listingLabel}</DialogTitle>
          <DialogDescription>Your enquiry goes to NokerBroker. Our team will contact you by phone or WhatsApp.</DialogDescription>
        </DialogHeader>
        {status === "authenticated" ? <form onSubmit={submitEnquiry} className="enquiry-form">
          <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
            <label htmlFor="enquiry-message">Message for our team</label>
            <textarea id="enquiry-message" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`I'm interested in ${listingLabel}. Please contact me.`} required />
          </div>
          <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 16 }}>
            <label htmlFor="enquiry-mode">How should our team reach you?</label>
            <select id="enquiry-mode" value={contactMode} onChange={(event) => setContactMode(event.target.value)}>
              {CONTACT_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send enquiry"}</button>
        </form> : <div className="enquiry-form">
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 16 }}>Log in and add your WhatsApp number in Profile so our team can contact you.</p>
          <Link className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} href={`/login?next=${nextPath}`}>Log in to send an enquiry</Link>
        </div>}
      </DialogContent>
    </Dialog>
  </div>;
}
