import Redis from "ioredis";

// Render dashboard se 'Internal Redis URL' ko yahan add karna
const redisUrl = process.env.REDIS_URL; 

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    // Internal network mein TLS ki zaroorat nahi hoti (Render default)
    connectTimeout: 10000,
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
});

redis.on("error", (err) => {
    console.log("❌ Render Internal Redis Error:", err.message);
});

redis.on("connect", () => {
    console.log("🚀 Render Internal Redis Connected Successfully!");
});

export default redis;