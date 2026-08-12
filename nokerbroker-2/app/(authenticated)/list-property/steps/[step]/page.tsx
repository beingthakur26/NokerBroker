// app/(authenticated)/list-property/steps/[step]/page.tsx
import { redirect } from "next/navigation";

export default function ListPropertyStepPage() {
  redirect("/list-property");
}
