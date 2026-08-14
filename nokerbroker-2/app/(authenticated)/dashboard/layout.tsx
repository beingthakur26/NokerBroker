import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

// Dashboard content is user-specific and reads live MongoDB data.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");

  return (
    <main className="dash-shell">
      <div className="wrap">
        <div className="dash-layout">
          <DashboardNav />
          <div className="dash-content">{children}</div>
        </div>
      </div>
    </main>
  );
}
