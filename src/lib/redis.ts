import { Redis } from "@upstash/redis";
import { env } from "@/config/env";

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

export async function incrementRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!redis) {
    return { success: true, remaining: max, reset: Date.now() + windowMs };
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
