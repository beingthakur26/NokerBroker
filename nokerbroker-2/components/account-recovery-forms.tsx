"use client";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export function VerifyEmailForm() {
  const token = useSearchParams().get("token"); const [message, setMessage] = useState("");
  async function verify() { const response = await fetch("/api/account/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }); const data = await response.json(); setMessage(data.error ?? "Email verified. You can now sign in."); }
  return <div className="receipt" style={{ padding: 32 }}><h1>Verify your email</h1><button className="btn btn-primary" onClick={verify} disabled={!token}>Verify email</button>{message && <p className="mt-3 text-sm">{message}</p>}</div>;
}

export function PasswordRecoveryForm() {
  const token = useSearchParams().get("token"); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const endpoint = token ? "/api/account/password-reset/confirm" : "/api/account/password-reset/request"; const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(token ? { token, password } : { email }) }); const data = await response.json(); setMessage(data.error ?? (token ? "Password reset. You can now sign in." : data.message)); }
  return <div className="receipt" style={{ padding: 32 }}><h1>{token ? "Choose a new password" : "Reset password"}</h1><form onSubmit={submit} className="space-y-3">{token ? <input className="w-full rounded-xl border border-border p-3" type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password (10+ characters)" required /> : <input className="w-full rounded-xl border border-border p-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required />}<button className="btn btn-primary" type="submit">{token ? "Reset password" : "Send reset link"}</button></form>{message && <p className="mt-3 text-sm">{message}</p>}</div>;
}
