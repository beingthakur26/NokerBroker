type RateLimitStore = Map<string, number[]>;

const globalWithRateLimit = globalThis as typeof globalThis & { requestRateLimits?: RateLimitStore };

function store() {
  return (globalWithRateLimit.requestRateLimits ??= new Map<string, number[]>());
}

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const history = store();
  for (const [entry, timestamps] of history) {
    const recent = timestamps.filter((timestamp) => now - timestamp < windowMs);
    if (recent.length) history.set(entry, recent);
    else history.delete(entry);
  }
  const timestamps = history.get(key) ?? [];
  if (timestamps.length >= limit) return true;
  history.set(key, [...timestamps, now]);
  return false;
}

/** Shared Upstash limiter in production, with the existing process-local limiter as a safe fallback. */
export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const development = process.env.NODE_ENV !== "production";
  if (!url || !token) {
    if (development) return !isRateLimited(key, limit, windowMs);
    console.error("[rate-limit] Upstash Redis must be configured in production.");
    return false;
  }
  try {
    const redisKey = `nokerbroker:rate:${key}`;
    const increment = await fetch(`${url}/incr/${encodeURIComponent(redisKey)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const count = Number((await increment.json()).result);
    if (count === 1) await fetch(`${url}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return count <= limit;
  } catch (error) {
    console.error("[rate-limit] Upstash unavailable", error);
    return development ? !isRateLimited(key, limit, windowMs) : false;
  }
}
