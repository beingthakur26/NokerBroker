// app/(public)/verify-otp/page.tsx
import { redirect } from "next/navigation";

export default function VerifyOtpPage() {
  redirect("/login");
}
