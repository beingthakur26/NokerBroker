"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useOtpAuth } from "@/hooks/use-otp-auth";

export function LoginForm({ hasGoogle }: { hasGoogle: boolean }) {
  const {
    step,
    phone,
    setPhone,
    otp,
    setOtp,
    loading,
    error,
    resendIn,
    sendOtp,
    verifyOtp,
    signInWithEmail,
    backToPhone,
  } = useOtpAuth();

  const [mode, setMode] = useState<"whatsapp" | "email">("whatsapp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submitPhone(event: FormEvent) {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length === 10) sendOtp();
  }

  function submitOtp(event: FormEvent) {
    event.preventDefault();
    if (otp.replace(/\D/g, "").length >= 4) verifyOtp();
  }

  function submitEmail(event: FormEvent) {
    event.preventDefault();
    if (email && password) signInWithEmail(email, password);
  }

  function signInWithGoogle() {
    signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="receipt" style={{ padding: 32 }}>
      <p className="eyebrow">NokerBroker login</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, margin: "8px 0 10px" }}>
        {mode === "whatsapp" ? "Continue with WhatsApp" : "Continue with email"}
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28, lineHeight: 1.6 }}>
        {mode === "whatsapp"
          ? "Use your Indian mobile number. We'll send a one-time verification code."
          : "Sign in with the email and password you registered with."}
      </p>

      {error && (
        <div className="form-alert" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {mode === "whatsapp" ? (
        step === "phone" ? (
          <form onSubmit={submitPhone}>
            <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
              <label htmlFor="phone">Mobile number</label>
              <input
                id="phone"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                required
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              type="submit"
              disabled={loading || phone.replace(/\D/g, "").length !== 10}
            >
              {loading ? "Sending code…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp}>
            <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
              <label htmlFor="otp">6-digit OTP</label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              type="submit"
              disabled={loading || otp.replace(/\D/g, "").length < 4}
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <div className="auth-inline-actions">
              <button className="link-more" type="button" onClick={backToPhone}>
                Change number
              </button>
              {resendIn > 0 ? (
                <span className="auth-resend">Resend in {resendIn}s</span>
              ) : (
                <button className="link-more" type="button" onClick={sendOtp}>
                  Resend code
                </button>
              )}
            </div>
          </form>
        )
      ) : (
        <form onSubmit={submitEmail}>
          <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <Link className="link-more" style={{ marginTop: 12, display: "block" }} href="/forgot-password">Forgot password?</Link>
          <button
            className="link-more"
            style={{ marginTop: 16, display: "block" }}
            type="button"
            onClick={() => setMode("whatsapp")}
          >
            Back to WhatsApp login
          </button>
        </form>
      )}

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 28, paddingTop: 24 }}>
        {mode === "whatsapp" && (
          <button
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border)" }}
            type="button"
            onClick={() => setMode("email")}
          >
            Continue with email &amp; password
          </button>
        )}
        {hasGoogle && (
          <button
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border)", marginTop: 8 }}
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            Continue with Google
          </button>
        )}
      </div>
      <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
        New here? <Link className="link-more" href="/signup">Create an account</Link>
      </p>
    </div>
  );
}
