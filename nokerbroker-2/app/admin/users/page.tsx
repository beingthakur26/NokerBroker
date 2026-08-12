import { requireAdmin } from "@/lib/admin";
import { getAllUsersAdmin } from "@/lib/users-db";
import { AdminUserRow } from "@/components/admin-user-row";

export const metadata = {
  title: "Users · Admin",
};

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const users = await getAllUsersAdmin();
  const admins = users.filter((user) => user.role === "ADMIN").length;

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Users
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            {users.length} users · {admins} admins
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <h2>No users yet</h2>
          <p>Users appear here once they sign up.</p>
        </div>
      ) : (
        <div className="dash-list">
          {users.map((user) => (
            <AdminUserRow
              key={user._id}
              id={user._id}
              name={user.name}
              email={user.email}
              whatsappNumber={user.whatsappNumber}
              whatsappVerified={user.whatsappVerified}
              role={user.role}
              city={user.city}
              createdAt={user.createdAt}
              self={session.user?.id === user._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
