import Link from "next/link";
import { formatPrice } from "../../lib/formatPrice";

interface ProjectCardProps {
  name: string;
  locality: string;
  priceFrom?: number | null;
  imageUrl?: string;
  unitCount?: number;
  constructionStatus?: string;
  href?: string;
}

const statusLabels: Record<string, string> = {
  UNDER_CONSTRUCTION: "Under construction",
  READY_TO_MOVE: "Ready to move",
  COMPLETED: "Completed",
};

export function ProjectCard({
  name,
  locality,
  priceFrom,
  imageUrl,
  unitCount,
  constructionStatus,
  href,
}: ProjectCardProps) {
  const body = (
    <>
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-orange-pale to-orange p-3 flex items-start justify-between">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="absolute inset-0 h-full w-full object-cover" />
        )}
        {imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />}
        {constructionStatus && (
          <span className="relative text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-full bg-white/90 text-ink">
            {statusLabels[constructionStatus] ?? constructionStatus}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="font-display text-base font-bold text-ink">{name}</div>
        <div className="text-xs text-ink-faint mt-0.5">{locality}</div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <span className="block text-[10.5px] font-mono uppercase tracking-widest text-ink-soft">From</span>
            <span className="font-mono text-lg font-semibold text-ink">
              {priceFrom ? formatPrice(priceFrom) : "—"}
            </span>
          </div>
          {unitCount !== undefined && (
            <span className="text-xs font-mono text-ink-soft">{unitCount} unit{unitCount === 1 ? "" : "s"}</span>
          )}
        </div>
        {href && (
          <span className="mt-4 inline-flex w-full items-center justify-center rounded-full border-[1.5px] border-orange py-2 text-xs font-semibold text-orange-deep transition group-hover:bg-orange group-hover:text-white">
            View project
          </span>
        )}
      </div>
    </>
  );

  const card = (
    <div className="group bg-white border border-border rounded-xl2 overflow-hidden shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)] hover:-translate-y-1 transition">
      {body}
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
