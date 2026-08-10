import Link from "next/link";

const columns = [
  {
    heading: "Explore",
    links: [
      { href: "/search", label: "Buy a home" },
      { href: "/projects", label: "Builder projects" },
      { href: "/compare", label: "Compare properties" },
      { href: "/emi-calculator", label: "EMI calculator" },
    ],
  },
  {
    heading: "Owners & builders",
    links: [
      { href: "/post-property", label: "Post property free" },
      { href: "/dashboard/builder", label: "Builder dashboard" },
      { href: "/signup", label: "Create an account" },
      { href: "/loans/apply", label: "Apply for a loan" },
    ],
  },
];

const localities = [
  { name: "Andheri West", slug: "andheri-west" },
  { name: "Bandra West", slug: "bandra-west" },
  { name: "Borivali West", slug: "borivali-west" },
  { name: "Thane West", slug: "thane-west" },
  { name: "Powai", slug: "powai" },
  { name: "Vashi", slug: "vashi" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-warm">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <span className="inline-block h-2 w-2 rounded-full bg-orange" />
              NokerBroker
            </div>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">
              Owner-verified, RERA-verified listings in Mumbai. No brokerage,
              no middlemen — ever.
            </p>
            <p className="mt-4 font-mono text-xs text-orange-deep font-bold">₹0 brokerage · always</p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-3">
                {column.heading}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink transition hover:text-orange-deep">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-3">
              Popular localities
            </p>
            <ul className="space-y-2.5">
              {localities.map((locality) => (
                <li key={locality.slug}>
                  <Link
                    href={`/mumbai/${locality.slug}`}
                    className="text-sm text-ink transition hover:text-orange-deep"
                  >
                    {locality.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-soft">© {new Date().getFullYear()} NokerBroker. All rights reserved.</p>
          <p className="text-xs text-ink-faint font-mono">Thikana · Mumbai · No brokerage</p>
        </div>
      </div>
    </footer>
  );
}
