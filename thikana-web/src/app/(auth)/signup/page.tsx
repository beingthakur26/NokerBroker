"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { apiPost } from "../../../lib/api-client";

type Role = "BUYER" | "SELLER" | "BUILDER";
type Step = "phone" | "otp";
type VerifyOtpResponse = { user: { role: Role } };

const roleCopy: Record<Role, { icon: string; label: string }> = {
  BUYER: { icon: "🔑", label: "Buyer" },
  SELLER: { icon: "🏠", label: "Seller" },
  BUILDER: { icon: "🏗️", label: "Builder" },
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("BUYER");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [reraId, setReraId] = useState("");
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
      const body: Record<string, string> = { phone, code, role };
      if (role === "BUILDER") {
        body.companyName = companyName.trim();
        body.reraId = reraId.trim();
      }
      const { user } = await apiPost<VerifyOtpResponse>("/auth/verify-signup-otp", body);
      if (user.role === "BUYER") {
        router.replace("/dashboard/buyer");
      } else if (user.role === "BUILDER") {
        router.replace("/dashboard/builder");
      } else {
        router.replace("/post-property");
      }
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
            {roleCopy[r].icon} {roleCopy[r].label}
          </button>
        ))}
      </div>

      {role === "BUILDER" && step === "phone" && (
        <div className="mb-4 rounded-xl2 border border-border bg-bg-warm p-4 space-y-3">
          <div>
            <label htmlFor="companyName" className="text-sm font-semibold text-ink block mb-1.5">
              Company name
            </label>
            <input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Kalpataru Realty"
              className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm bg-white"
            />
          </div>
          <div>
            <label htmlFor="reraId" className="text-sm font-semibold text-ink block mb-1.5">
              RERA ID
            </label>
            <input
              id="reraId"
              value={reraId}
              onChange={(e) => setReraId(e.target.value)}
              placeholder="e.g. P51900012345"
              className="w-full border-[1.5px] border-border rounded-xl2 px-3.5 py-3 text-sm bg-white"
            />
          </div>
          <p className="text-xs text-ink-soft">
            Your company is reviewed by our team before you can publish projects.
          </p>
        </div>
      )}

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
