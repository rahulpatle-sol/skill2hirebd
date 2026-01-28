import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

// 1. Sabse pehle env load karo (Zaroori hai!)
dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// 2. Debugging ke liye check karo (Inhe hata dena baad mein)
if (!redisUrl || !redisToken) {
    console.error("⚠️  UPSTASH_REDIS_REST_URL or TOKEN is undefined in process.env!");
}

// 3. Redis client initialize karo
const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

const connectRedis = async () => {
    try {
        // HTTP/REST mein handshake test
        await redis.set("ping", "pong");
        console.log("🚀 Upstash Redis (HTTPS/REST) Connected Successfully!");
    } catch (error) {
        console.error("❌ Redis Connection Test Failed:", error.message);
    }
};

export { redis, connectRedis };
export default redis;