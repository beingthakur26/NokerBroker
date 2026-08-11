# Adding WhatsApp OTP Login — Implementation Guide

This plugs into the stack from the main plan (Next.js + Auth.js + MSG91 + MongoDB/Mongoose). It replaces "enter password" with "enter WhatsApp number → get a code on WhatsApp → enter code → signed in," and can coexist with email/password and Google login.

> MSG91's exact API parameter names get revised periodically — the calls below reflect their current v5 OTP pattern. Before you wire this up for real, pull up your MSG91 dashboard → API docs and confirm parameter names against what's shown there; the *shape* of the flow (send → verify → session) won't change even if a field name does.

---

## 1. One-time setup on MSG91's side

1. Create an MSG91 account → set up a **WhatsApp Business Account (WABA)** under their WhatsApp product.
2. Create an **Authentication template** for OTP (Meta requires OTP messages to use a pre-approved "Authentication" template category, not a free-form message). Something like: `Your NokerBroker verification code is {{1}}. Valid for 10 minutes.`
3. Get the template approved (Meta review, usually a few hours to 1–2 days).
4. Grab your **Auth Key** and the **Template ID** from the MSG91 dashboard — you'll need both as env vars.
5. Test with a **regular personal WhatsApp number**, not another business account — Meta blocks authentication templates between two WABAs, so testing OTP delivery to another business number will silently fail and isn't a bug on your end.

---

## 2. Environment variables

```
MSG91_AUTH_KEY=your_auth_key
MSG91_WHATSAPP_TEMPLATE_ID=your_template_id
NEXTAUTH_SECRET=
```

---

## 3. Backend: OTP send/verify helper

```ts
// lib/whatsapp-otp.ts
import axios from "axios";

const BASE_URL = "https://control.msg91.com/api/v5/otp";

export async function sendWhatsappOtp(whatsappNumber: string) {
  // whatsappNumber must include country code, no "+", e.g. "919820012345"
  const res = await axios.post(
    BASE_URL,
    {
      template_id: process.env.MSG91_WHATSAPP_TEMPLATE_ID,
      mobile: whatsappNumber,
      otp_channel: "whatsapp", // routes delivery to WhatsApp instead of SMS
    },
    { headers: { authkey: process.env.MSG91_AUTH_KEY!, "Content-Type": "application/json" } }
  );
  return res.data; // { type: "success", message: "..." } on success
}

export async function verifyWhatsappOtp(whatsappNumber: string, otp: string) {
  const res = await axios.get(`${BASE_URL}/verify`, {
    params: { mobile: whatsappNumber, otp },
    headers: { authkey: process.env.MSG91_AUTH_KEY! },
  });
  return res.data.type === "success"; // true if the code matched and hasn't expired
}
```

MSG91 stores and expires the OTP on their side — you don't need your own OTP table or Redis entry for this. Your server just relays the send/verify calls and decides what to do with a "verified" result.

---

## 4. API routes

```ts
// app/api/otp/send/route.ts
import { NextResponse } from "next/server";
import { sendWhatsappOtp } from "@/lib/whatsapp-otp";

export async function POST(req: Request) {
  const { whatsappNumber } = await req.json();

  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    return NextResponse.json({ error: "Invalid WhatsApp number" }, { status: 400 });
  }

  // Rate limiting note (see Security section below) belongs here, before the send call.

  try {
    await sendWhatsappOtp(whatsappNumber);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not send OTP" }, { status: 500 });
  }
}
```

```ts
// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { verifyWhatsappOtp } from "@/lib/whatsapp-otp";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const { whatsappNumber, otp } = await req.json();

  const isValid = await verifyWhatsappOtp(whatsappNumber, otp);
  if (!isValid) {
    return NextResponse.json({ error: "Incorrect or expired code" }, { status: 401 });
  }

  await dbConnect();

  // find-or-create — a WhatsApp-verified number is enough to create an account
  let user = await User.findOne({ whatsappNumber });
  if (!user) {
    user = await User.create({
      whatsappNumber,
      whatsappVerified: true,
      name: "New User",           // collected/edited later in onboarding
      email: `${whatsappNumber}@placeholder.nokerbroker.in`, // replace once they add a real email
    });
  } else if (!user.whatsappVerified) {
    user.whatsappVerified = true;
    await user.save();
  }

  return NextResponse.json({ ok: true, userId: user._id.toString() });
}
```

---

## 5. Wiring it into Auth.js (NextAuth) as a Credentials provider

The two API routes above do the actual OTP work. NextAuth's job is just to turn "this WhatsApp number was verified" into a signed-in session.

```ts
// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyWhatsappOtp } from "@/lib/whatsapp-otp";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "whatsapp-otp",
      name: "WhatsApp OTP",
      credentials: {
        whatsappNumber: { label: "WhatsApp number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.whatsappNumber || !credentials?.otp) return null;

        const isValid = await verifyWhatsappOtp(credentials.whatsappNumber, credentials.otp);
        if (!isValid) return null;

        await dbConnect();
        let user = await User.findOne({ whatsappNumber: credentials.whatsappNumber });
        if (!user) {
          user = await User.create({
            whatsappNumber: credentials.whatsappNumber,
            whatsappVerified: true,
            name: "New User",
            email: `${credentials.whatsappNumber}@placeholder.nokerbroker.in`,
          });
        }

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
    // ...GoogleProvider, email/password CredentialsProvider go here too
  ],
  session: { strategy: "jwt" },
};
```

With this provider registered, signing in from the client is a normal NextAuth `signIn()` call — the "send OTP" step happens separately (via `/api/otp/send`) before you ever call `signIn`, since NextAuth's `authorize()` only runs once, at the final submit.

---

## 6. Frontend: two-step form

```tsx
// components/whatsapp-login-form.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function WhatsappLoginForm() {
  const [step, setStep] = useState<"number" | "otp">("number");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({ whatsappNumber }),
    });
    setLoading(false);
    if (res.ok) setStep("otp");
    else setError("Couldn't send OTP — check the number and try again.");
  }

  async function handleVerify() {
    setLoading(true);
    setError("");
    const res = await signIn("whatsapp-otp", {
      whatsappNumber,
      otp,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError("Incorrect or expired code.");
    else window.location.href = "/dashboard";
  }

  if (step === "number") {
    return (
      <div className="space-y-3">
        <input
          className="w-full rounded-xl border border-border px-4 py-3"
          placeholder="WhatsApp number, e.g. 9820012345"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-accent btn-block" onClick={handleSendOtp} disabled={loading}>
          {loading ? "Sending…" : "Send code on WhatsApp"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">Code sent to {whatsappNumber} on WhatsApp.</p>
      <input
        className="w-full rounded-xl border border-border px-4 py-3 tracking-widest"
        placeholder="6-digit code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn btn-accent btn-block" onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying…" : "Verify & continue"}
      </button>
      <button className="btn btn-ghost btn-block" onClick={() => setStep("number")}>
        Change number
      </button>
    </div>
  );
}
```

---

## 7. Security details worth not skipping

- **Rate-limit `/api/otp/send`** per number and per IP (e.g. max 3 sends per number per 10 minutes) — otherwise it's an open door to burn through your MSG91 WhatsApp credits or spam a number. A simple in-memory or Redis counter is enough at your scale; don't ship this route unguarded.
- **Never trust a client-reported "verified" flag.** The `authorize()` function above re-verifies the OTP against MSG91 server-side on every sign-in attempt — the frontend never gets to just say "trust me, it's verified."
- **Resend cooldown** — disable the "Send code" button for ~30–60 seconds after each send, both for UX and to avoid re-triggering MSG91 sends on every re-render.
- **Number normalization** — store and query `whatsappNumber` in one consistent format (e.g. always digits-only with country code, no `+`, no spaces) so `findOne({ whatsappNumber })` doesn't silently miss on formatting differences.
- **Placeholder email collision:** the `${whatsappNumber}@placeholder.nokerbroker.in` pattern above is fine as a stopgap so `email` stays unique and non-null, but prompt the user to add a real email in onboarding — you'll want it for password-reset-style flows and receipts later.

---

## 8. What changes elsewhere in the project

- `/login` and `/signup` become the same screen — "Continue with WhatsApp" is the primary CTA, email/password and Google are secondary options underneath.
- `/verify-otp` route from the main plan is effectively replaced by the inline two-step form above (send → verify happens on one screen, no separate page navigation needed) — you can drop that route or keep it as a fallback for deep-linked flows (e.g. re-verifying an unverified number from the dashboard).
- Loan applications and listing submissions that previously checked `phoneVerified` now check `whatsappVerified` on the `User` document — already reflected in the schema from the main plan.
