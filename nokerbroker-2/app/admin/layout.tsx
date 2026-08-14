import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin-nav";

// Admin pages read live MongoDB data and must not be generated at build time.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <main className="dash-shell">
      <div className="wrap">
        <div className="dash-layout">
          <AdminNav />
          <div className="dash-content">{children}</div>
        </div>
      </div>
    </main>
  );
}
