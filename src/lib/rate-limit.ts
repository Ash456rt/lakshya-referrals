/**
 * In-memory sliding-window rate limiter (per process). Good enough for a
 * single-server deployment; swap for Redis if you scale to multiple instances.
 */
const buckets = new Map<string, number[]>();

export function rateLimited(
  ip: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const list = (buckets.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    buckets.set(ip, list);
    return true;
  }
  list.push(now);
  buckets.set(ip, list);
  return false;
}

/** Best-effort client IP from proxies. */
export function clientIp(req: { headers: Headers }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}
