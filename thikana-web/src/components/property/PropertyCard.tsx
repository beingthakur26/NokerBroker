import { VerifiedStamp } from "../ui/VerifiedStamp";

interface PropertyCardProps {
  price: string;
  meta: string;
  locality: string;
  verified?: boolean;
  noBrokerage?: boolean;
}

export function PropertyCard({
  price,
  meta,
  locality,
  verified,
  noBrokerage,
}: PropertyCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl2 overflow-hidden shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)] hover:-translate-y-1 transition">
      <div className="h-44 bg-gradient-to-br from-orange-pale to-orange relative p-3 flex items-start justify-between">
        {noBrokerage && (
          <span className="text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-ink text-white">
            NO BROKERAGE
          </span>
        )}
        {verified && <VerifiedStamp size="sm" />}
      </div>
      <div className="p-4">
        <div className="font-mono text-lg font-semibold text-ink">{price}</div>
        <div className="text-sm text-ink-soft mt-1.5">{meta}</div>
        <div className="text-xs text-ink-faint mt-0.5">{locality}</div>
        <div className="flex gap-2 mt-3.5">
          <button className="flex-1 py-2 rounded-full border-[1.5px] border-orange text-orange-deep text-xs font-semibold">
            Call
          </button>
          <button className="flex-1 py-2 rounded-full border-[1.5px] border-whatsapp text-whatsapp text-xs font-semibold">
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}