import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

// Keep the dashboard-style URL working for existing bookmarks and manually
// entered links. The canonical, separately guarded admin area is /admin.
export default async function DashboardAdminRedirect() {
  await requireAdmin();
  redirect("/admin");
}
