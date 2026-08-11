"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
        <p className="eyebrow">Something went wrong</p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(30px, 5vw, 44px)",
            fontWeight: 600,
            margin: "12px 0",
          }}
        >
          We couldn&apos;t load this page.
        </h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
          Try again, or head back home while we sort it out.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={reset}>Try again</button>
          <Link className="btn btn-ghost" style={{ border: "1px solid var(--border)" }} href="/">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
