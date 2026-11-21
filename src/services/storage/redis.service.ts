import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

export const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  reconnectOnError: () => true,
});

redisClient.on("connect", () => {
  console.log("[Redis] Connected successfully.");
});

redisClient.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

export async function setRedis(key: string, data: any, ttl: number = 0): Promise<void> {
  try {
    await redisClient.set(key, JSON.stringify(data));
    if (ttl > 0) {
      await redisClient.expire(key, ttl);
    }
  } catch (error: any) {
    console.error("[Redis] setRedis error:", error);
  }
}

export async function getRedis<T>(key: string): Promise<T | null> {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error: any) {
    console.error("[Redis] getRedis error:", error);
    return null;
  }
}

export async function clearRedis(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error: any) {
    console.error("[Redis] clearRedis error:", error);
  }
}