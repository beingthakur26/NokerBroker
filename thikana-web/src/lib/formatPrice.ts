export function formatPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (price >= 100_000) return `₹${(price / 100_000).toFixed(1).replace(/\.0$/, "")} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}
