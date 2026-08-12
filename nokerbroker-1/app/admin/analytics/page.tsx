import { requireAdmin } from "@/lib/admin";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Inquiry from "@/models/Inquiry";
import User from "@/models/User";
import { AdminAnalytics } from "@/components/admin-charts";

export const metadata = {
  title: "Analytics · Admin",
};

interface TrendPoint {
  label: string;
  count: number;
}

interface Slice {
  name: string;
  value: number;
}

function buildTrend(docs: { createdAt: Date | string }[], days: number): TrendPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: TrendPoint[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - index);
    buckets.push({
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      count: 0,
    });
  }
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - days + 1);
  for (const doc of docs) {
    const created = new Date(doc.createdAt);
    if (created < cutoff) continue;
    const key = created.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const bucket = buckets.find((entry) => entry.label === key);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  await dbConnect();

  const [properties, inquiries, users] = await Promise.all([
    Property.find({}, "createdAt status locality").lean(),
    Inquiry.find({}, "createdAt").lean(),
    User.find({}, "createdAt").lean(),
  ]);

  const statusDist: Slice[] = ["ACTIVE", "SOLD", "RENTED", "DRAFT", "ARCHIVED", "FLAGGED"]
    .map((name) => ({ name, value: properties.filter((property) => property.status === name).length }))
    .filter((slice) => slice.value > 0);

  const localityMap = new Map<string, number>();
  for (const property of properties) {
    const key = property.locality || "Unknown";
    localityMap.set(key, (localityMap.get(key) ?? 0) + 1);
  }
  const localityDist: Slice[] = Array.from(localityMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div>
      <div className="dash-head-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "6px 0 4px" }}>
            Analytics
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            Marketplace activity over the last 30 days
          </p>
        </div>
      </div>

      <AdminAnalytics
        propertiesTrend={buildTrend(properties, 30)}
        inquiriesTrend={buildTrend(inquiries, 30)}
        usersTrend={buildTrend(users, 30)}
        statusDist={statusDist}
        localityDist={localityDist}
      />
    </div>
  );
}
