"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#1f6feb", "#24a148", "#f2a33c", "#9d4edd", "#e0526e", "#7c828c"];

interface TrendPoint {
  label: string;
  count: number;
}

interface StatusSlice {
  name: string;
  value: number;
}

interface LocalitySlice {
  name: string;
  value: number;
}

interface AdminAnalyticsProps {
  propertiesTrend: TrendPoint[];
  inquiriesTrend: TrendPoint[];
  usersTrend: TrendPoint[];
  statusDist: StatusSlice[];
  localityDist: LocalitySlice[];
}

export function AdminAnalytics({
  propertiesTrend,
  inquiriesTrend,
  usersTrend,
  statusDist,
  localityDist,
}: AdminAnalyticsProps) {
  return (
    <div className="analytics-grid">
      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Listings created (last 30 days)</h2>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={propertiesTrend}>
              <defs>
                <linearGradient id="gradProps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f6feb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1f6feb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Listings" stroke="#1f6feb" fill="url(#gradProps)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Inquiries received (last 30 days)</h2>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inquiriesTrend}>
              <defs>
                <linearGradient id="gradInq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9d4edd" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9d4edd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Inquiries" stroke="#9d4edd" fill="url(#gradInq)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>New users (last 30 days)</h2>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
              <Tooltip />
              <Bar dataKey="count" name="Users" fill="#24a148" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Listings by status</h2>
        </div>
        <div className="chart-box chart-box-pie">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusDist} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                {statusDist.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {statusDist.map((slice, index) => (
              <span key={slice.name}>
                <i style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                {slice.name} · {slice.value}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-panel admin-panel-wide">
        <div className="admin-panel-head">
          <h2>Listings by locality</h2>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={localityDist} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip />
              <Bar dataKey="value" name="Listings" fill="#1f6feb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
