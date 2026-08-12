"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function useOtpAuth() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = useCallback((seconds: number) => {
    setResendIn(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function sendOtp() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not send the code.");
      setStep("otp");
      startResendTimer(data.resendIn ?? 30);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send the code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("whatsapp-otp", {
        whatsappNumber: phone,
        otp,
        name: name.trim() || undefined,
        redirect: false,
      });
      if (result?.error) {
        setError("Incorrect or expired code. Please try again.");
        return;
      }
      const next =
        new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not verify the code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithEmail(emailValue: string, passwordValue: string) {
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("email-password", {
        email: emailValue,
        password: passwordValue,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function backToPhone() {
    setStep("phone");
    setOtp("");
    setError(null);
  }

  return {
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
    signInWithEmail,
    backToPhone,
  };
}
