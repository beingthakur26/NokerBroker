"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { apiPost } from "../../../lib/api-client";

type Role = "BUYER" | "SELLER" | "BUILDER";
type Step = "phone" | "otp";
type VerifyOtpResponse = { user: { role: Role } };

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("BUYER");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
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

  async function handleVerify() {
    setError("");
    setLoading(true);
    try {
      const { user } = await apiPost<VerifyOtpResponse>("/auth/verify-signup-otp", { phone, code, role });
      if (user.role === "SELLER" || user.role === "BUILDER") {
        router.replace("/post-property");
        return;
      }
      router.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white border border-border rounded-xl2 p-9 shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)]">
      <h2 className="font-display text-xl text-ink">Create your account</h2>
      <p className="text-sm text-ink-soft mt-1.5">Choose how you&apos;ll use Thikana</p>

      <div className="grid grid-cols-3 gap-2.5 my-5">
        {(["BUYER", "SELLER", "BUILDER"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`border-[1.5px] rounded-xl2 py-4 px-2 text-center text-xs font-semibold ${
              role === r ? "border-orange bg-orange-pale" : "border-border"
            }`}
          >
            {r === "BUYER" ? "🔑 Buyer" : r === "SELLER" ? "🏠 Seller" : "🏗️ Builder"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {step === "phone" ? (
        <>
          <label className="text-sm font-semibold text-ink block mb-1.5">Mobile number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919812345678"
            className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm mb-4"
          />
          <Button variant="accent" block onClick={handleSendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </>
      ) : (
        <>
          <label className="text-sm font-semibold text-ink block mb-1.5">Enter the 6-digit code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            placeholder="••••••"
            className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm mb-4 font-mono tracking-widest"
          />
          <Button variant="primary" block onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </>
      )}
    </div>
  );
}
