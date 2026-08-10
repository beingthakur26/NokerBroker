import Link from "next/link";
import { VerifiedStamp } from "../ui/VerifiedStamp";

interface PropertyCardProps {
  price: string;
  meta: string;
  locality: string;
  imageUrl?: string;
  verified?: boolean;
  noBrokerage?: boolean;
  href?: string;
}

export function PropertyCard({
  price,
  meta,
  locality,
  imageUrl,
  verified,
  noBrokerage,
  href,
}: PropertyCardProps) {
  const card = (
    <div className="bg-white border border-border rounded-xl2 overflow-hidden shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)] hover:-translate-y-1 transition">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-orange-pale to-orange p-3 flex items-start justify-between">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={locality}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />}
        {noBrokerage && (
          <span className="relative text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-ink text-white">
            NO BROKERAGE
          </span>
        )}
        {verified && <div className="relative"> <VerifiedStamp size="sm" /> </div>}
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

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
