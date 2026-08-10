"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { apiPost } from "../../lib/api-client";

type Role = "BUYER" | "SELLER" | "BUILDER";
type LoginResponse = { user: { role: Role } };

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setError("");
    setLoading(true);
    try {
      await apiPost("/auth/request-otp", { phone });
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setLoading(true);
    try {
      const { user } = await apiPost<LoginResponse>("/auth/verify-login-otp", { phone, code });
      router.replace(user.role === "SELLER" || user.role === "BUILDER" ? "/dashboard/seller" : "/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto mt-16 bg-white border border-border rounded-xl2 p-9 shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)]">
      <h1 className="font-display text-xl text-ink">Welcome back</h1>
      <p className="text-sm text-ink-soft mt-1.5">Log in with the mobile number linked to your account.</p>
      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      {step === "phone" ? (
        <div className="mt-5"><label htmlFor="phone" className="text-sm font-semibold text-ink block mb-1.5">Mobile number</label><input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+919812345678" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm mb-4" /><Button variant="accent" block onClick={sendOtp} disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button></div>
      ) : (
        <div className="mt-5"><label htmlFor="code" className="text-sm font-semibold text-ink block mb-1.5">Enter the 6-digit code</label><input id="code" value={code} onChange={(event) => setCode(event.target.value)} maxLength={6} placeholder="••••••" className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm mb-4 font-mono tracking-widest" /><Button variant="primary" block onClick={verifyOtp} disabled={loading}>{loading ? "Verifying..." : "Log in"}</Button></div>
      )}
      <p className="text-sm text-ink-soft mt-5">New here? <Link href="/signup" className="font-semibold text-orange-deep">Create an account</Link></p>
    </main>
  );
}
