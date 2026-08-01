/**
 * In-memory sliding-window rate limiter, keyed by client IP + a caller-supplied
 * bucket name. Deliberately simple (no Redis) — appropriate for a single-instance
 * small-business deployment; note it resets on restart and doesn't share state
 * across multiple server instances, so it won't hold up under horizontal scaling.
 * Good enough to blunt brute-force/credential-stuffing/spam against auth and
 * order endpoints, which is the actual threat model here.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Sweep old buckets periodically so this doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > 10 * 60 * 1000) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Returns true if the request is allowed, false if it should be rejected (429).
 * `limit` requests per `windowMs` per (bucketName, ip) pair.
 */
export function checkRateLimit(bucketName: string, ip: string, limit: number, windowMs: number): boolean {
  const key = `${bucketName}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
