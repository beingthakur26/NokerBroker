"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useOtpAuth } from "@/hooks/use-otp-auth";

export function SignupForm({ hasGoogle }: { hasGoogle: boolean }) {
  const {
    step,
    phone,
    setPhone,
    name,
    setName,
    otp,
    setOtp,
    loading,
    error,
    resendIn,
    sendOtp,
    verifyOtp,
    backToPhone,
  } = useOtpAuth();

  function submitDetails(event: FormEvent) {
    event.preventDefault();
    if (name.trim() && phone.replace(/\D/g, "").length === 10) sendOtp();
  }

  function submitOtp(event: FormEvent) {
    event.preventDefault();
    if (otp.replace(/\D/g, "").length >= 4) verifyOtp();
  }

  function signUpWithGoogle() {
    signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="receipt" style={{ padding: 32 }}>
      <p className="eyebrow">NokerBroker sign up</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, margin: "8px 0 10px" }}>
        Create your account
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 28, lineHeight: 1.6 }}>
        {step === "phone"
          ? "Tell us who you are. We'll verify your Indian mobile number over WhatsApp."
          : `We sent a one-time code to +91 ${phone}.`}
      </p>

      {error && (
        <div className="form-alert" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={submitDetails}>
          <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              required
            />
          </div>
          <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
            <label htmlFor="signup-phone">WhatsApp number</label>
            <input
              id="signup-phone"
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
            disabled={loading || !name.trim() || phone.replace(/\D/g, "").length !== 10}
          >
            {loading ? "Sending code…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitOtp}>
          <div className="search-field" style={{ border: "1px solid var(--border)", marginBottom: 12 }}>
            <label htmlFor="signup-otp">6-digit OTP</label>
            <input
              id="signup-otp"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
          <div className="auth-inline-actions">
            <button className="link-more" type="button" onClick={backToPhone}>
              Change details
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
      )}

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 28, paddingTop: 24 }}>
        {hasGoogle && (
          <button
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border)" }}
            type="button"
            onClick={signUpWithGoogle}
            disabled={loading}
          >
            Continue with Google
          </button>
        )}
        <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          By continuing you agree to NokerBroker&apos;s{" "}
          <Link className="link-more" href="/trust-safety">Terms &amp; Privacy Policy</Link>.
        </p>
      </div>
      <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink-soft)" }}>
        Already have an account? <Link className="link-more" href="/login">Sign in</Link>
      </p>
    </div>
  );
}
