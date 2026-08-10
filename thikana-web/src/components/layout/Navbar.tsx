"use client";

import Link from "next/link";
import { useSession } from "../../lib/useSession";

const Navbar = () => {
  const { user, loading } = useSession();
  const canManageListings = user?.role === "SELLER" || user?.role === "BUILDER";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-9 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-ink"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-orange" />
          NokerBroker
        </Link>

        <nav className="hidden flex-1 gap-7 text-sm font-medium text-ink-soft md:flex">
          <Link href="/search">Buy</Link>
          <Link href="/projects">Builder Projects</Link>
          <Link href="/emi-calculator">EMI Calculator</Link>
          <Link href="/help">Help</Link>
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
              <Link href="/profile" className="text-sm font-semibold text-ink hover:text-orange-deep">Profile</Link>
              {canManageListings && (
                <>
                  <Link href="/dashboard/seller" className="text-sm font-semibold text-ink hover:text-orange-deep">My listings</Link>
                  <Link
                    href="/post-property"
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
