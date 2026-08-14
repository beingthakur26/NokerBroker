import { Suspense } from "react";
import { PasswordRecoveryForm } from "@/components/account-recovery-forms";
export default function ForgotPasswordPage() { return <main className="section"><div className="wrap" style={{ maxWidth: 560 }}><Suspense><PasswordRecoveryForm /></Suspense></div></main>; }
