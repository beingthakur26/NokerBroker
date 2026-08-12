import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin-nav";

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
