// import { Navbar } from "@/components/layout/Navbar";
import Navbar from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { PropertyCard } from "../components/property/PropertyCard";
import { VerifiedStamp } from "../components/ui/VerifiedStamp";

const localities = [
  { name: "Andheri West", count: "3,240 listings" },
  { name: "Borivali", count: "1,860 listings" },
  { name: "Thane West", count: "4,110 listings" },
  { name: "Navi Mumbai — Vashi", count: "2,290 listings" },
];

const featured = [
  { price: "₹1.4 Cr onwards", meta: "Kalpataru Vivant · 2 & 3 BHK", locality: "Thane West · Possession Dec 2027", verified: true },
  { price: "₹2.1 Cr onwards", meta: "Lodha Amara · 1, 2 & 3 BHK", locality: "Kolshet Road, Thane", verified: true },
  { price: "₹95 L onwards", meta: "Godrej Horizon · 1 & 2 BHK", locality: "Vikhroli, Central Mumbai", verified: true },
];

export default function Home() {
  return (
    <>
      <Navbar />

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
              <Button variant="accent">Search Properties</Button>
              <Button variant="outline">Post Property Free</Button>
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
              <div key={l.name} className="bg-white border border-border rounded-xl2 p-5 relative overflow-hidden min-h-[104px] flex flex-col justify-end hover:border-orange hover:-translate-y-0.5 transition">
                <div className="absolute -top-7 -right-7 w-20 h-20 rounded-full bg-orange-pale" />
                <b className="font-display text-base relative">{l.name}</b>
                <span className="font-mono text-[11.5px] text-ink-soft relative">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="py-16 bg-bg-warm">
        <div className="max-w-[1200px] mx-auto px-6">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-deep block mb-2">
            Featured
          </span>
          <h2 className="font-display text-2xl text-ink mb-7">New builder projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((p) => (
              <PropertyCard key={p.meta} {...p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}