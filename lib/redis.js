import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redis = null;
let isRedisOffline = false;

try {
  if (process.env.REDIS_ENABLED === "true" || process.env.NODE_ENV === "production" || REDIS_URL) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true // Don't block loading
    });

    redis.on("error", (err) => {
      if (!isRedisOffline) {
        console.warn("⚠️ Redis cache is offline. Continuing with database/API directly.");
        isRedisOffline = true;
      }
    });

    redis.on("connect", () => {
      console.log("🚀 Redis Cache connection established successfully.");
      isRedisOffline = false;
    });

    // Fire off async connection
    redis.connect().catch(() => {
      isRedisOffline = true;
    });
  }
} catch (e) {
  console.warn("⚠️ Redis initialization skipped. Operating without cache layer.");
  isRedisOffline = true;
}

export async function getCache(key) {
  if (!redis || isRedisOffline) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = 3600) {
  if (!redis || isRedisOffline) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    // Fail silently
  }
}

export async function invalidateCache(key) {
  if (!redis || isRedisOffline) return;
  try {
    await redis.del(key);
  } catch (err) {
    // Fail silently
  }
}

export { redis };
