import { PropertyCard } from "../../../components/property-card";
import { headers } from "next/headers";

const properties = [
  { slug: "chembur-2-bhk-115-cr", price: "₹1.15 Cr", title: "2 BHK apartment", locality: "Chembur, Mumbai", areaSqft: 820, floor: "4th", furnishing: "Semi-furnished" },
  { slug: "malad-west-1-bhk-62-l", price: "₹62 L", title: "1 BHK apartment", locality: "Malad West, Mumbai", areaSqft: 510, floor: "2nd", furnishing: "Unfurnished" },
  { slug: "bandra-west-3-bhk-235-cr", price: "₹2.35 Cr", title: "3 BHK apartment", locality: "Bandra West, Mumbai", areaSqft: "1,240", floor: "9th", furnishing: "Furnished" },
  { slug: "powai-2-bhk-140-cr", price: "₹1.4 Cr", title: "2 BHK apartment", locality: "Powai, Mumbai", areaSqft: 900, floor: "7th", furnishing: "Semi-furnished" },
  { slug: "thane-west-1-bhk-85-l", price: "₹85 L", title: "1 BHK apartment", locality: "Thane West", areaSqft: 620, floor: "5th", furnishing: "Furnished" },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BuyPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const locality = valueOf(params.locality) ?? "";
  const budget = valueOf(params.budget) ?? "Any budget";
  const bhk = valueOf(params.bhk) ?? "Any";

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const apiResponse = await fetch(`${protocol}://${host}/api/properties`, { cache: "no-store" });
  const apiData = apiResponse.ok ? await apiResponse.json() : { properties };
  const apiProperties = apiData.properties ?? properties;

  const filtered = apiProperties.filter((property: typeof properties[number]) => {
    const localityMatch = !locality || property.locality.toLowerCase().includes(locality.toLowerCase());
    const bhkMatch = bhk === "Any" || property.title.toLowerCase().startsWith(bhk.toLowerCase());
    const budgetMatch = budget === "Any budget" ||
      (budget === "Under ₹50 L" && property.price.includes("L") && Number(property.price.replace(/[^0-9.]/g, "")) < 50) ||
      (budget === "₹50 L – ₹1 Cr" && property.price.includes("L") && Number(property.price.replace(/[^0-9.]/g, "")) >= 50) ||
      (budget === "₹1 Cr – ₹2 Cr" && property.price.includes("Cr") && Number(property.price.replace(/[^0-9.]/g, "")) >= 1 && Number(property.price.replace(/[^0-9.]/g, "")) < 2) ||
      (budget === "₹2 Cr+" && property.price.includes("Cr") && Number(property.price.replace(/[^0-9.]/g, "")) >= 2);
    return localityMatch && bhkMatch && budgetMatch;
  });

  return (
    <main>
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Zero brokerage · Direct owners</p>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "42px", lineHeight: 1.1, marginTop: 8 }}>Properties for sale</h1>
              <p>Search results update from your locality, budget and BHK filters.</p>
            </div>
            <span className="link-more">{filtered.length} listings</span>
          </div>

          <div className="search-card" style={{ marginBottom: 32 }}>
            <div className="search-field"><label>Locality</label><span>{locality || "Any locality"}</span></div>
            <div className="search-field"><label>Budget</label><span>{budget}</span></div>
            <div className="search-field"><label>BHK</label><span>{bhk}</span></div>
          </div>

          {filtered.length ? (
            <div className="prop-grid">
              {filtered.map((property) => (
                <PropertyCard key={property.slug} {...property} detailsHref={`/buy/${property.slug}`} whatsappHref="https://wa.me/919999999999" />
              ))}
            </div>
          ) : (
            <div className="receipt" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>No matching listings</h2>
              <p>Try a broader locality, budget or BHK filter.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
