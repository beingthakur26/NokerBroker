"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { apiPatch, apiPost } from "../../lib/api-client";
import { SessionUser, useSession } from "../../lib/useSession";

function ProfileForm({ user }: { user: SessionUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function saveProfile() {
    setMessage("");
    setSaving(true);
    try {
      const details: { name?: string; email?: string } = {};
      if (name.trim()) details.name = name.trim();
      if (email.trim()) details.email = email.trim();
      await apiPatch("/auth/me", details);
      setMessage("Profile saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await apiPost("/auth/logout");
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <span className="text-xs font-mono uppercase tracking-widest text-orange-deep">Your account</span>
      <h1 className="font-display text-3xl text-ink mt-2">Profile</h1>
      <div className="mt-7 bg-white border border-border rounded-xl2 p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="font-semibold text-ink">{user.role.toLowerCase()}</p>
            <p className="text-sm text-ink-soft">{user.verified ? "Verified account" : "Account verification pending"}</p>
          </div>
          <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-orange-pale text-orange-deep">{user.role}</span>
        </div>
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-ink block mb-1.5">Name</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-ink block mb-1.5">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Mobile number</p>
          <p className="text-sm text-ink-soft mt-1">{user.phone}</p>
          <p className="text-xs text-ink-faint mt-1">Your mobile number is your OTP login identity and cannot be changed here.</p>
        </div>
        {message && <p className="text-sm text-ink-soft">{message}</p>}
        <div className="flex flex-wrap gap-3">
          <Button variant="accent" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          <Button variant="outline" onClick={logout}>Log out</Button>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading || !user) return <p className="text-center mt-20 text-ink-soft">Loading...</p>;
  return <ProfileForm key={user.id} user={user} />;
}
