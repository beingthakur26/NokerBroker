"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/buy", label: "Buy" },
  { href: "/projects", label: "New Projects" },
  { href: "/list-property", label: "Sell" },
  { href: "/loans", label: "Loans" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  function handleSignOut() {
    setOpen(false);
    signOut({ callbackUrl: "/" });
  }

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link className="logo" href="/" onClick={() => setOpen(false)}>
          <span>Noker</span><span className="dot">Broker</span>
        </Link>

        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {status === "authenticated" && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="gap-2 px-2 rounded-full"
                    aria-label="Account menu"
                  />
                }
              >
                <span className="nav-avatar">{initials(session.user.name)}</span>
                <span className="nav-user">{session.user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/favorites" />}>
                    Saved homes
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/listings" />}>
                    My listings
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/listings/new" />}>
                    + List a property
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/projects/new" />}>
                    + List a project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link className="btn btn-ghost" href="/login">Log in</Link>
              <Link className="btn btn-primary" href="/signup">Sign up</Link>
            </>
          )}
        </div>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-mobile"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="nav-mobile" id="nav-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="nav-mobile-actions">
            {status === "authenticated" && session?.user ? (
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                Log out
              </Button>
            ) : (
              <>
                <Link className="btn btn-ghost" href="/login" onClick={() => setOpen(false)}>Log in</Link>
                <Link className="btn btn-primary" href="/signup" onClick={() => setOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function initials(name?: string | null): string {
  if (!name) return "A";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
