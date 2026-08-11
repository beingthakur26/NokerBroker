import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create your NokerBroker account with your name and WhatsApp number. Get verified, shortlist homes, and message owners directly.",
};

export default function SignupPage() {
  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 560 }}>
        <SignupForm />
      </div>
    </main>
  );
}
