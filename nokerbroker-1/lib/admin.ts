import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN";
}

export async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return isAdminRole(session.user.role) || isAdminEmail(session.user.email);
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (!(isAdminRole(session.user.role) || isAdminEmail(session.user.email))) {
    redirect("/");
  }
  return session;
}
