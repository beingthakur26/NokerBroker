"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

type Item = { _id: string; message: string; read: boolean; createdAt: string; link?: string };
export function NotificationBell() {
  const [items, setItems] = useState<Item[]>([]); const [open, setOpen] = useState(false); const [unread, setUnread] = useState(0);
  async function load() { const response = await fetch("/api/notifications"); if (response.ok) { const data = await response.json(); setItems(data.notifications.slice(0, 5)); setUnread(data.unreadCount ?? 0); } }
  useEffect(() => { const initial = window.setTimeout(() => { void load(); }, 0); const timer = window.setInterval(load, 60_000); return () => { window.clearTimeout(initial); clearInterval(timer); }; }, []);
  return <div className="relative"><button type="button" className="btn btn-ghost relative px-2" aria-label={`${unread} unread notifications`} onClick={() => { setOpen((value) => !value); if (!open) void load(); }}><Bell size={19} />{unread > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-orange px-1 text-xs text-white">{unread}</span>}</button>{open && <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-white p-3 shadow-xl"><div className="mb-2 flex items-center justify-between"><strong>Notifications</strong><Link className="link-more text-sm" href="/dashboard/notifications" onClick={() => setOpen(false)}>View all</Link></div>{items.length ? <div className="space-y-2">{items.map((item) => <Link key={item._id} href={item.link ?? "/dashboard/notifications"} className={`block rounded-lg p-2 text-sm ${item.read ? "bg-white" : "bg-orange-pale"}`} onClick={() => setOpen(false)}>{item.message}<small className="mt-1 block text-xs text-ink-soft">{new Date(item.createdAt).toLocaleString("en-IN")}</small></Link>)}</div> : <p className="p-3 text-sm text-ink-soft">You are all caught up.</p>}</div>}</div>;
}
