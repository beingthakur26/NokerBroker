import Link from "next/link";
import { Button } from "../ui/Button";
import { formatPrice } from "../../lib/formatPrice";

export interface ComparableListing {
  id: string;
  type: "FLAT" | "VILLA" | "PLOT" | "COMMERCIAL";
  locality: string;
  pinCode: string;
  price: number;
  areaSqft: number;
  bhk: number;
  description?: string;
  amenities?: string[];
  images: string[];
  status?: string;
}

const typeLabels: Record<ComparableListing["type"], string> = {
  FLAT: "Flat / Apartment",
  VILLA: "Villa / House",
  PLOT: "Plot / Land",
  COMMERCIAL: "Commercial",
};

interface Row {
  label: string;
  value: (listing: ComparableListing) => string | undefined;
}

const rows: Row[] = [
  { label: "Price", value: (l) => formatPrice(l.price) },
  { label: "Type", value: (l) => typeLabels[l.type] },
  { label: "Configuration", value: (l) => `${l.bhk} BHK` },
  { label: "Carpet area", value: (l) => `${l.areaSqft.toLocaleString("en-IN")} sq.ft` },
  { label: "Locality", value: (l) => l.locality },
  { label: "Pin code", value: (l) => l.pinCode },
];

export function ComparisonTable({
  listings,
  onRemove,
}: {
  listings: ComparableListing[];
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl2 border border-border bg-white shadow-[0_2px_4px_rgba(196,80,10,0.04),0_16px_40px_rgba(196,80,10,0.08)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-4 text-[10.5px] font-mono uppercase tracking-widest text-ink-soft w-32 align-top">
              Compare
            </th>
            {listings.map((listing) => (
              <th key={listing.id} className="px-5 py-4 align-top">
                <div className="relative h-36 rounded-xl2 overflow-hidden bg-gradient-to-br from-orange-pale to-orange">
                  {listing.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.images[0]}
                      alt={listing.locality}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
                {onRemove && (
                  <button
                    onClick={() => onRemove(listing.id)}
                    className="mt-2 text-xs font-semibold text-ink-faint hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-0">
              <td className="px-5 py-4 text-[10.5px] font-mono uppercase tracking-widest text-ink-soft align-top">
                {row.label}
              </td>
              {listings.map((listing) => (
                <td key={listing.id} className="px-5 py-4 font-semibold text-ink align-top">
                  {row.value(listing)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-b border-border">
            <td className="px-5 py-4 text-[10.5px] font-mono uppercase tracking-widest text-ink-soft align-top">
              Amenities
            </td>
            {listings.map((listing) => (
              <td key={listing.id} className="px-5 py-4 align-top">
                {listing.amenities && listing.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {listing.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-[11px] px-2.5 py-1 rounded-full border-[1.5px] border-border text-ink-soft"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-ink-faint">—</span>
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-5 py-4 text-[10.5px] font-mono uppercase tracking-widest text-ink-soft align-top">
              Actions
            </td>
            {listings.map((listing) => (
              <td key={listing.id} className="px-5 py-4 align-top">
                <div className="flex flex-col gap-2.5 max-w-[220px]">
                  <Link href={`/property/${listing.id}`} className="flex-1">
                    <Button variant="outline" block>View details</Button>
                  </Link>
                  <Link href={`/loans/apply?price=${Math.round(listing.price)}`} className="flex-1">
                    <Button variant="primary" block>Apply for loan</Button>
                  </Link>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
