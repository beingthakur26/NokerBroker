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
