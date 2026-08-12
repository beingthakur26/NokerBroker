"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Blocks,
  Heart,
  MessagesSquare,
  Landmark,
  User,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "My listings", icon: Building2 },
  { href: "/dashboard/listings/new", label: "List a property", icon: PlusCircle },
  { href: "/dashboard/projects", label: "My projects", icon: Blocks },
  { href: "/dashboard/projects/new", label: "List a project", icon: PlusCircle },
  { href: "/dashboard/favorites", label: "Saved homes", icon: Heart },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: MessagesSquare },
  { href: "/dashboard/loans", label: "Loans", icon: Landmark },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="dash-nav" aria-label="Dashboard">
      <p className="dash-nav-title">My Space</p>
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
    </nav>
  );
}
