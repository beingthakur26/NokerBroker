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
    console.error("Global Error Boundary caught error:", error?.message || String(error));
  }, [error]);

  const isDbError =
    error?.message?.includes("MongoDB") ||
    error?.message?.includes("Mongoose") ||
    error?.message?.includes("whitelist") ||
    error?.message?.includes("connect");

  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 640, textAlign: "center", margin: "60px auto" }}>
        <p className="eyebrow" style={{ color: "#f4600f", fontWeight: 700, textTransform: "uppercase", fontSize: "12px" }}>
          {isDbError ? "Database Connection Error" : "Something went wrong"}
        </p>
        <h1
          style={{
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 700,
            margin: "12px 0",
            color: "#241a14",
          }}
        >
          {isDbError ? "Database Unavailable" : "We couldn't load this page"}
        </h1>
        <p style={{ color: "#7a6a5f", marginBottom: 28, fontSize: "15px", lineHeight: "1.6" }}>
          {isDbError
            ? "Your MongoDB Atlas IP is not whitelisted or database connection timed out. Please add your current IP address to the MongoDB Atlas Network Access IP Whitelist (0.0.0.0/0 for access anywhere)."
            : "An unexpected error occurred while loading this page. Please try again."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-ghost" style={{ border: "1px solid #f0e1d3" }} href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
