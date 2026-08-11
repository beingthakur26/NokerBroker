"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  function submitPhone(event: FormEvent) {
    event.preventDefault();
    if (/^[6-9]\d{9}$/.test(phone)) setStep("otp");
  }

  function submitOtp(event: FormEvent) {
    event.preventDefault();
    // Wire this to your Twilio Verify endpoint when the auth API is ready.
  }

  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <div className="receipt" style={{ padding: 32 }}>
          <p className="eyebrow">NokerBroker login</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, margin: "8px 0 10px" }}>Continue with WhatsApp</h1>
          <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>Use your Indian mobile number. We&apos;ll send a one-time verification code.</p>

          {step === "phone" ? (
            <form onSubmit={submitPhone}>
              <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
                <label htmlFor="phone">Mobile number</label>
                <input id="phone" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" required />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} type="submit">Send OTP</button>
            </form>
          ) : (
            <form onSubmit={submitOtp}>
              <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
                <label htmlFor="otp">6-digit OTP</label>
                <input id="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="123456" required />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} type="submit">Verify & continue</button>
              <button className="link-more" style={{ marginTop: 16 }} type="button" onClick={() => setStep("phone")}>Change number</button>
            </form>
          )}

          <div style={{ borderTop: "1px solid var(--border)", marginTop: 28, paddingTop: 24 }}>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border)" }}>Continue with email & password</button>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border)", marginTop: 8 }}>Continue with Google</button>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>New here? <Link className="link-more" href="/signup">Create an account</Link></p>
        </div>
      </div>
    </main>
  );
}
