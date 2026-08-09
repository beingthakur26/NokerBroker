import Link from "next/link";
import { Button } from "../ui/Button";

const Navbar = () => {
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
          <Link href="/buy">Buy</Link>
          <Link href="/projects">Builder Projects</Link>
          <Link href="/emi-calculator">EMI Calculator</Link>
          <Link href="/help">Help</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Button variant="outline">Log in</Button>
          <Button variant="accent">+ Post Property Free</Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;