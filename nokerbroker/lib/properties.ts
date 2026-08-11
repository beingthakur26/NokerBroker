export interface Property {
  slug: string;
  priceValue: number;
  title: string;
  locality: string;
  areaSqft: number;
  floor: string;
  furnishing: string;
  bhk: number;
  verified: boolean;
  images: string[];
  description: string;
  ownerName: string;
  ownerWhatsapp: string;
}

export const properties: Property[] = [
  {
    slug: "chembur-2-bhk-115-cr",
    priceValue: 11500000,
    title: "2 BHK apartment",
    locality: "Chembur, Mumbai",
    areaSqft: 820,
    floor: "4th floor",
    furnishing: "Semi-furnished",
    bhk: 2,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Sunny 2 BHK in a gated Chembur society with direct owner contact and ownership documents on file. Walking distance to the station and a 10-acre garden.",
    ownerName: "Rohan Kulkarni",
    ownerWhatsapp: "919999999999",
  },
  {
    slug: "malad-west-1-bhk-62-l",
    priceValue: 6200000,
    title: "1 BHK apartment",
    locality: "Malad West, Mumbai",
    areaSqft: 510,
    floor: "2nd floor",
    furnishing: "Unfurnished",
    bhk: 1,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Compact 1 BHK in Malad West near Infinity Mall. Owner-verified number, ready for immediate possession, zero brokerage.",
    ownerName: "Sneha Iyer",
    ownerWhatsapp: "919999999998",
  },
  {
    slug: "bandra-west-3-bhk-235-cr",
    priceValue: 23500000,
    title: "3 BHK apartment",
    locality: "Bandra West, Mumbai",
    areaSqft: 1240,
    floor: "9th floor",
    furnishing: "Furnished",
    bhk: 3,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Fully furnished 3 BHK sea-view apartment in Bandra West. Listed directly by the owner with verified ownership paperwork.",
    ownerName: "Arjun Mehta",
    ownerWhatsapp: "919999999997",
  },
  {
    slug: "powai-2-bhk-140-cr",
    priceValue: 14000000,
    title: "2 BHK apartment",
    locality: "Powai, Mumbai",
    areaSqft: 900,
    floor: "7th floor",
    furnishing: "Semi-furnished",
    bhk: 2,
    verified: true,
    images: [],
    description:
      "Verified 2 BHK overlooking the Powai lake. Direct owner communication, parking included, ready to move in.",
    ownerName: "Kavita Shah",
    ownerWhatsapp: "919999999996",
  },
  {
    slug: "thane-west-1-bhk-85-l",
    priceValue: 8500000,
    title: "1 BHK apartment",
    locality: "Thane West",
    areaSqft: 620,
    floor: "5th floor",
    furnishing: "Furnished",
    bhk: 1,
    verified: true,
    images: [],
    description:
      "Furnished 1 BHK in Thane West near Ghodbunder Road. Owner selling directly — no brokerage on the deal.",
    ownerName: "Prakash Nair",
    ownerWhatsapp: "919999999995",
  },
  {
    slug: "andheri-west-1-rk-48-l",
    priceValue: 4800000,
    title: "1 RK studio",
    locality: "Andheri West, Mumbai",
    areaSqft: 380,
    floor: "3rd floor",
    furnishing: "Semi-furnished",
    bhk: 1,
    verified: true,
    images: [],
    description:
      "Perfect starter studio near Andheri station. Owner-verified WhatsApp number, minimal maintenance, ideal for singles.",
    ownerName: "Divya Rao",
    ownerWhatsapp: "919999999994",
  },
  {
    slug: "goregaon-east-2-bhk-120-cr",
    priceValue: 12000000,
    title: "2 BHK apartment",
    locality: "Goregaon East, Mumbai",
    areaSqft: 850,
    floor: "6th floor",
    furnishing: "Semi-furnished",
    bhk: 2,
    verified: true,
    images: [],
    description:
      "2 BHK with a balcony facing the Aarey forest line. Direct owner contact, verified documents, ready possession.",
    ownerName: "Nikhil Joshi",
    ownerWhatsapp: "919999999993",
  },
  {
    slug: "vikhroli-1-bhk-55-l",
    priceValue: 5500000,
    title: "1 BHK apartment",
    locality: "Vikhroli, Mumbai",
    areaSqft: 460,
    floor: "8th floor",
    furnishing: "Unfurnished",
    bhk: 1,
    verified: true,
    images: [],
    description:
      "Affordable 1 BHK in Vikhroli with metro connectivity. Owner selling directly, zero brokerage, quick deal possible.",
    ownerName: "Farah Khan",
    ownerWhatsapp: "919999999992",
  },
  {
    slug: "bandra-west-1-bhk-110-cr",
    priceValue: 11000000,
    title: "1 BHK apartment",
    locality: "Bandra West, Mumbai",
    areaSqft: 550,
    floor: "5th floor",
    furnishing: "Furnished",
    bhk: 1,
    verified: true,
    images: [],
    description:
      "Rare 1 BHK in Bandra West near Linking Road, fully furnished and ready. Verified owner, no broker fee.",
    ownerName: "Ishaan Malhotra",
    ownerWhatsapp: "919999999991",
  },
  {
    slug: "chembur-3-bhk-185-cr",
    priceValue: 18500000,
    title: "3 BHK apartment",
    locality: "Chembur, Mumbai",
    areaSqft: 1350,
    floor: "11th floor",
    furnishing: "Semi-furnished",
    bhk: 3,
    verified: true,
    images: [],
    description:
      "Spacious 3 BHK high-rise flat in Chembur with city views. Direct owner, verified ownership docs, parking included.",
    ownerName: "Meera Pillai",
    ownerWhatsapp: "919999999990",
  },
  {
    slug: "malad-west-2-bhk-98-l",
    priceValue: 9800000,
    title: "2 BHK apartment",
    locality: "Malad West, Mumbai",
    areaSqft: 780,
    floor: "12th floor",
    furnishing: "Semi-furnished",
    bhk: 2,
    verified: true,
    images: [],
    description:
      "Corner 2 BHK in Malad West with cross ventilation. Owner listed directly — message them on WhatsApp, skip the broker.",
    ownerName: "Vikram Desai",
    ownerWhatsapp: "919999999989",
  },
  {
    slug: "powai-3-bhk-280-cr",
    priceValue: 28000000,
    title: "3 BHK apartment",
    locality: "Powai, Mumbai",
    areaSqft: 1750,
    floor: "15th floor",
    furnishing: "Furnished",
    bhk: 3,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Premium lake-facing 3 BHK in a 5-star clubhouse society. Fully furnished, verified ownership, direct owner deal.",
    ownerName: "Anita Kapoor",
    ownerWhatsapp: "919999999988",
  },
];

export function formatPrice(value: number): string {
  if (value >= 1_00_00_000) {
    const crore = value / 1_00_00_000;
    const text = Number.isInteger(crore) ? `${crore}` : crore.toFixed(2).replace(/\.?0+$/, "");
    return `₹${text} Cr`;
  }
  if (value >= 1_00_000) {
    const lakh = value / 1_00_000;
    const text = Number.isInteger(lakh) ? `${lakh}` : lakh.toFixed(2).replace(/\.?0+$/, "");
    return `₹${text} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString("en-IN")} sqft`;
}

export const budgetBuckets = [
  "Under ₹50 L",
  "₹50 L – ₹1 Cr",
  "₹1 Cr – ₹2 Cr",
  "₹2 Cr+",
] as const;

export type BudgetBucket = (typeof budgetBuckets)[number];

export function matchesBudget(priceValue: number, budget: string): boolean {
  switch (budget) {
    case "Under ₹50 L":
      return priceValue < 50_00_000;
    case "₹50 L – ₹1 Cr":
      return priceValue >= 50_00_000 && priceValue < 1_00_00_000;
    case "₹1 Cr – ₹2 Cr":
      return priceValue >= 1_00_00_000 && priceValue < 2_00_00_000;
    case "₹2 Cr+":
      return priceValue >= 2_00_00_000;
    default:
      return true;
  }
}

export interface PropertyFilters {
  locality?: string;
  budget?: string;
  bhk?: string;
  sort?: "recommended" | "price-low" | "price-high" | "area";
}

export function filterProperties(
  source: Property[],
  filters: PropertyFilters
): Property[] {
  let result = source.filter((property) => {
    const localityMatch =
      !filters.locality ||
      property.locality.toLowerCase().includes(filters.locality.toLowerCase());
    const bhkValue = Number(filters.bhk);
    const bhkMatch =
      !filters.bhk ||
      filters.bhk === "Any" ||
      property.bhk === bhkValue ||
      (filters.bhk === "4" && property.bhk >= 4);
    const budgetMatch =
      !filters.budget || filters.budget === "Any budget" || matchesBudget(property.priceValue, filters.budget);
    return localityMatch && bhkMatch && budgetMatch;
  });

  switch (filters.sort) {
    case "price-low":
      result = [...result].sort((a, b) => a.priceValue - b.priceValue);
      break;
    case "price-high":
      result = [...result].sort((a, b) => b.priceValue - a.priceValue);
      break;
    case "area":
      result = [...result].sort((a, b) => b.areaSqft - a.areaSqft);
      break;
    default:
      result = [...result].sort((a, b) => Number(b.verified) - Number(a.verified));
  }

  return result;
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((property) => property.slug === slug);
}

export function getRelatedProperties(current: Property, count = 3): Property[] {
  return properties
    .filter((property) => property.slug !== current.slug)
    .sort((a, b) => {
      const aScore =
        (a.locality === current.locality ? 2 : 0) + (a.bhk === current.bhk ? 1 : 0);
      const bScore =
        (b.locality === current.locality ? 2 : 0) + (b.bhk === current.bhk ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, count);
}
