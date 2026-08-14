import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/account-recovery-forms";
export default function VerifyEmailPage() { return <main className="section"><div className="wrap" style={{ maxWidth: 560 }}><Suspense><VerifyEmailForm /></Suspense></div></main>; }
