import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section">
      <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
        <p className="eyebrow">404</p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(34px, 6vw, 52px)",
            fontWeight: 600,
            margin: "12px 0",
          }}
        >
          This page slipped off the market.
        </h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          No brokerage is owed on a 404, either.
        </p>
        <Link className="btn btn-primary" href="/">Back to home</Link>
      </div>
    </main>
  );
}
