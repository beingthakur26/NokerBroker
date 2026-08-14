"use client";

import { FormEvent, useEffect, useState } from "react";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
}

export function InquiryConversation({ inquiryId, currentUserId }: { inquiryId: string; currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/inquiries/${inquiryId}/messages`).then(async (response) => {
      const data = await response.json();
      if (response.ok) setMessages(data.messages);
      else setError(data.error ?? "Could not load conversation");
    }).catch(() => setError("Could not load conversation"));
  }, [inquiryId, open]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: draft }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not send reply");
      setMessages((current) => [...current, data.message]);
      setDraft("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send reply");
    } finally {
      setSending(false);
    }
  }

  return <div>
    <button className="link-more" type="button" onClick={() => setOpen((value) => !value)}>{open ? "Hide conversation" : "View conversation"}</button>
    {open && <div className="mt-3 space-y-3 rounded-xl border border-border bg-bg-warm p-3">
      {messages.map((message) => <div key={message.id} className={message.senderId === currentUserId ? "text-right" : "text-left"}><p className="inline-block max-w-[85%] rounded-xl bg-white px-3 py-2 text-sm text-ink">{message.body}</p><small className="block text-xs text-ink-soft">{message.senderId === currentUserId ? "You" : message.senderName} · {new Date(message.createdAt).toLocaleString("en-IN")}</small></div>)}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form onSubmit={send} className="flex gap-2"><input className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm" value={draft} maxLength={2000} onChange={(event) => setDraft(event.target.value)} placeholder="Write a reply" /><button className="btn btn-primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Reply"}</button></form>
    </div>}
  </div>;
}
