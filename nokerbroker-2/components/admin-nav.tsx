"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Blocks,
  MessagesSquare,
  BarChart3,
  ShieldAlert,
  Landmark,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Building2 },
  { href: "/admin/projects", label: "Projects", icon: Blocks },
  { href: "/admin/builders", label: "Builder reviews", icon: Building2 },
  { href: "/admin/loans", label: "Loan applications", icon: Landmark },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessagesSquare },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="dash-nav" aria-label="Admin">
      <p className="dash-nav-title">Admin</p>
      <ul>
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link href={link.href} className={active ? "active" : undefined}>
                <link.icon size={16} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link className="dash-nav-back" href="/">← Back to site</Link>
    </nav>
  );
}
