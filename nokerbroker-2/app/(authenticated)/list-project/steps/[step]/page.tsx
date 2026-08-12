// app/(authenticated)/list-project/steps/[step]/page.tsx
import { redirect } from "next/navigation";

export default function ListProjectStepPage() {
  redirect("/dashboard/projects/new");
}
