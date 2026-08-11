import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to NokerBroker with WhatsApp OTP, email, or Google to shortlist homes, get verified, and message owners directly.",
};

export default function LoginPage() {
  const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID);

  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <LoginForm hasGoogle={hasGoogle} />
      </div>
    </main>
  );
}
