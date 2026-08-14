// app/(authenticated)/loans/apply/[step]/page.tsx
import { redirect } from "next/navigation";

export default function LoanApplyStepPage() {
  redirect("/dashboard/loans");
}
