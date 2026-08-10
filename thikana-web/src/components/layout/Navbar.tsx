"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/useSession";
import { apiPost } from "../../lib/api-client";

function dashboardHref(role: string) {
  if (role === "SELLER") return "/dashboard/seller";
  if (role === "BUILDER") return "/dashboard/builder";
  if (role === "ADMIN") return "/admin";
  return "/dashboard/buyer";
}

const navLinks = [
  { href: "/search", label: "Buy" },
  { href: "/projects", label: "Builder Projects" },
  { href: "/emi-calculator", label: "EMI Calculator" },
];

const Navbar = () => {
  const { user, loading } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isManager = user?.role === "SELLER" || user?.role === "BUILDER";

  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    try {
      await apiPost("/auth/logout");
    } catch {
      // ignore — still navigate away
    }
    router.replace("/");
    router.refresh();
  }

  const displayName = user?.name?.trim() || (user ? `+${user.phone.slice(-4)}` : "");
  const initials = user?.name?.trim() ? user.name.trim()[0].toUpperCase() : (user ? user.phone.slice(-2) : "?");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span className="inline-block h-2 w-2 rounded-full bg-orange" />
          NokerBroker
        </Link>

        <nav className="hidden flex-1 items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-orange-deep">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border-[1.5px] border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-orange hover:text-orange-deep"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(244,96,15,0.28)] transition hover:bg-orange-deep"
              >
                Sign up
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              {isManager && (
                <Link
                  href={user.role === "BUILDER" ? "/dashboard/builder" : "/post-property"}
                  aria-label="Post Property"
                  className="group inline-flex items-center gap-2 rounded-full bg-orange py-2 pl-2 pr-2 text-white shadow-[0_6px_16px_rgba(244,96,15,0.28)] transition hover:bg-orange-deep hover:pr-4"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-base font-bold leading-none">
                    +
                  </span>
                  <span className="hidden text-sm font-semibold sm:inline max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-24 group-hover:opacity-100">
                    Post Property
                  </span>
                </Link>
              )}

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((value) => !value)}
                  aria-expanded={open}
                  aria-haspopup="menu"
                  className="flex items-center gap-2.5 rounded-full border-[1.5px] border-border py-1.5 pl-1.5 pr-3 transition hover:border-orange"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange text-sm font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden text-sm font-semibold text-ink sm:inline">
                    {displayName}
                  </span>
                  <span aria-hidden className="flex flex-col gap-[3px]">
                    <span className="h-[1.5px] w-4 bg-ink-soft" />
                    <span className="h-[1.5px] w-4 bg-ink-soft" />
                    <span className="h-[1.5px] w-4 bg-ink-soft" />
                  </span>
                </button>

                {open && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl2 border border-border bg-white shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.12)]"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm font-semibold text-ink">{user.name?.trim() || "Thikana user"}</p>
                      <p className="text-xs text-ink-soft font-mono">{user.role.toLowerCase()}</p>
                    </div>
                    <div className="py-1.5">
                      <Link
                        href={dashboardHref(user.role)}
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-bg-warm hover:text-orange-deep"
                      >
                        Dashboard
                      </Link>
                      {isManager && (
                        <Link
                          href="/post-property"
                          role="menuitem"
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-bg-warm hover:text-orange-deep"
                        >
                          Post property
                        </Link>
                      )}
                      {user.role === "BUILDER" && (
                        <Link
                          href="/dashboard/builder"
                          role="menuitem"
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-bg-warm hover:text-orange-deep"
                        >
                          My projects
                        </Link>
                      )}
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          role="menuitem"
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-bg-warm hover:text-orange-deep"
                        >
                          Admin queue
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-bg-warm hover:text-orange-deep"
                      >
                        Profile & settings
                      </Link>
                    </div>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full border-t border-border px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-bg-warm"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
