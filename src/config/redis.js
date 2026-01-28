import Redis from "ioredis";

// Render pe hum REDIS_URL environment variable set karenge
// Local pe ye apne aap 127.0.0.1 use kar lega
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // BullMQ requirements
    // Agar Upstash (SSL) use ho raha hai toh ye zaroori hai
    tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined
});

redis.on("error", (err) => console.log("❌ Redis Error:", err));
redis.on("connect", () => console.log("🚀 Redis Connected Successfully!"));

export default redis;