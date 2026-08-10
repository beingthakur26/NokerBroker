// import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { LiveListings } from "../components/property/LiveListings";
import { FeaturedProjects } from "../components/project/FeaturedProjects";
import { VerifiedStamp } from "../components/ui/VerifiedStamp";

const localities = [
  { name: "Andheri West", slug: "andheri-west", count: "3,240 listings" },
  { name: "Borivali West", slug: "borivali-west", count: "1,860 listings" },
  { name: "Thane West", slug: "thane-west", count: "4,110 listings" },
  { name: "Vashi", slug: "vashi", count: "2,290 listings" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute -top-56 -right-44 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(244,96,15,0.20),rgba(255,138,76,0.05)_60%,transparent_72%)]" />
        <div className="max-w-[1200px] mx-auto px-6 relative flex flex-col md:flex-row gap-14 items-center">
          <div className="flex-1 max-w-[560px]">
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-deep bg-orange-pale px-3.5 py-1.5 rounded-full mb-4">
              ● Mumbai · No Brokerage · RERA Verified
            </span>
            <h1 className="font-display text-5xl leading-[1.06] text-ink">
              A home you&apos;ll love, <em className="italic text-orange-deep">owned</em> honestly.
            </h1>
            <p className="text-ink-soft text-base mt-4 max-w-[480px] leading-relaxed">
              Every listing is owner or RERA-verified. Talk to the person who
              actually holds the keys — no brokerage, no middlemen, ever.
            </p>
            <div className="flex gap-3 mt-8">
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(244,96,15,0.28)] transition hover:bg-orange-deep"
              >
                Search Properties
              </Link>
              <Link
                href="/post-property"
                className="inline-flex items-center justify-center rounded-full border-[1.5px] border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-orange hover:text-orange-deep"
              >
                Post Property Free
              </Link>
            </div>
            <div className="flex gap-9 mt-9 flex-wrap">
              <div>
                <b className="font-mono text-2xl block text-ink">41,200+</b>
                <span className="text-xs text-ink-soft">Verified listings</span>
              </div>
              <div>
                <b className="font-mono text-2xl block text-ink">860+</b>
                <span className="text-xs text-ink-soft">RERA-verified builders</span>
              </div>
              <div>
                <b className="font-mono text-2xl block text-ink">₹0</b>
                <span className="text-xs text-ink-soft">Brokerage, always</span>
              </div>
            </div>
          </div>

          <div className="flex-1 h-[420px] w-full rounded-[28px] relative overflow-hidden bg-gradient-to-br from-[#FFE9DB] via-[#FFD3B0] to-orange shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)]">
            <div className="absolute top-6 right-6">
              <VerifiedStamp size="sm" label="VERIFIED" sublabel="OWNER" />
            </div>
            <div className="absolute bottom-6 left-6 bg-white rounded-2xl px-4 py-3.5 shadow-lg">
              <div className="font-mono text-lg font-semibold text-ink">₹1.65 Cr</div>
              <span className="text-xs text-ink-soft">2 BHK · Lokhandwala, Andheri West</span>
            </div>
          </div>
        </div>
      </section>

      {/* Localities */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex justify-between items-end mb-7">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-deep block mb-2">
                Explore by micro-market
              </span>
              <h2 className="font-display text-2xl text-ink">Popular localities in Mumbai</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {localities.map((l) => (
              <Link
                key={l.name}
                href={`/mumbai/${l.slug}`}
                className="bg-white border border-border rounded-xl2 p-5 relative overflow-hidden min-h-[104px] flex flex-col justify-end hover:border-orange hover:-translate-y-0.5 transition"
              >
                <div className="absolute -top-7 -right-7 w-20 h-20 rounded-full bg-orange-pale" />
                <b className="font-display text-base relative">{l.name}</b>
                <span className="font-mono text-[11.5px] text-ink-soft relative">{l.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LiveListings />

      {/* Featured projects */}
      <section className="py-16 bg-bg-warm">
        <div className="max-w-[1200px] mx-auto px-6">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-deep block mb-2">
            Featured
          </span>
          <h2 className="font-display text-2xl text-ink mb-7">New builder projects</h2>
          <FeaturedProjects />
        </div>
      </section>
    </>
  );
}
