"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link className="logo" href="/">
          <span>Noker</span><span className="dot">Broker</span>
        </Link>

        <div className="nav-links">
          <Link href="/buy">Buy</Link>
          <Link href="/projects">New Projects</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/loans">Loans</Link>
        </div>

        <div className="nav-actions">
          {session ? (
            <Link className="btn btn-ghost" href="/dashboard">Dashboard</Link>
          ) : (
            <Link className="btn btn-ghost" href="/login">Log in</Link>
          )}
          {session ? (
            <span className="nav-user">{session.user?.name ?? "Account"}</span>
          ) : (
            <Link className="btn btn-primary" href="/signup">Sign up</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
