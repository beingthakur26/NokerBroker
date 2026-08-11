import { NextResponse } from "next/server";

const properties = [
  { slug: "chembur-2-bhk-115-cr", price: "₹1.15 Cr", title: "2 BHK apartment", locality: "Chembur, Mumbai", areaSqft: 820, floor: "4th", furnishing: "Semi-furnished", verified: true },
  { slug: "malad-west-1-bhk-62-l", price: "₹62 L", title: "1 BHK apartment", locality: "Malad West, Mumbai", areaSqft: 510, floor: "2nd", furnishing: "Unfurnished", verified: true },
  { slug: "bandra-west-3-bhk-235-cr", price: "₹2.35 Cr", title: "3 BHK apartment", locality: "Bandra West, Mumbai", areaSqft: "1,240", floor: "9th", furnishing: "Furnished", verified: true },
  { slug: "powai-2-bhk-140-cr", price: "₹1.4 Cr", title: "2 BHK apartment", locality: "Powai, Mumbai", areaSqft: 900, floor: "7th", furnishing: "Semi-furnished", verified: true },
  { slug: "thane-west-1-bhk-85-l", price: "₹85 L", title: "1 BHK apartment", locality: "Thane West", areaSqft: 620, floor: "5th", furnishing: "Furnished", verified: true },
];

export async function GET() {
  return NextResponse.json({ properties });
}
