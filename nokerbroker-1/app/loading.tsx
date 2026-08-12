export default function Loading() {
  return (
    <main className="section">
      <div className="wrap" style={{ textAlign: "center", paddingBlock: 80 }}>
        <div className="loader" aria-hidden="true">
          <span>Noker</span><span className="dot">Broker</span>
        </div>
        <p style={{ color: "var(--ink-soft)", marginTop: 12 }}>Loading…</p>
      </div>
    </main>
  );
}
