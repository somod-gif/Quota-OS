import { Redis } from "@upstash/redis";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export function getRedis(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const redis = getRedis();

const memoryBuckets = new Map<string, { count: number; expiresAt: number }>();
let memoryWarned = false;

function memoryIncrement(key: string, windowMs: number): { count: number; expiresAt: number } {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.expiresAt <= now) {
    const bucket = { count: 1, expiresAt: now + windowMs };
    memoryBuckets.set(key, bucket);
    if (memoryBuckets.size > 10_000) {
      for (const [k, v] of memoryBuckets) {
        if (v.expiresAt <= now) memoryBuckets.delete(k);
      }
    }
    return bucket;
  }

  existing.count += 1;
  return existing;
}

export async function incrementRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!redis) {
    if (!memoryWarned) {
      memoryWarned = true;
      logger.warn(
        "UPSTASH_REDIS_REST_URL/TOKEN not configured — rate limiting is per-instance (in-memory). Add Upstash Redis env vars for consistent distributed rate limiting.",
      );
    }

    const bucket = memoryIncrement(key, windowMs);
    return {
      success: bucket.count <= max,
      remaining: Math.max(0, max - bucket.count),
      reset: bucket.expiresAt,
    };
  }

  const now = Date.now();
  const windowKey = Math.floor(now / windowMs);
  const redisKey = `ratelimit:${key}:${windowKey}`;

  const current = await redis.incr(redisKey);

  if (current === 1) {
    await redis.expire(redisKey, Math.ceil(windowMs / 1000));
  }

  const ttl = await redis.ttl(redisKey);
  const reset = now + ttl * 1000;

  return {
    success: current <= max,
    remaining: Math.max(0, max - current),
    reset,
  };
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  return redis.get<T>(key);
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  if (!redis) return;
  await redis.set(key, value, { ex: ttl });
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redis) return;
  await redis.del(key);
}

export { redis };
