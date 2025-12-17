// /lib/redis.js
import Redis from "ioredis";

const redis = new Redis({
    host: process.env.SERVER_REDIS,  // IP server Redis
    port: 6379,            // port default Redis
    password: process.env.REDIS_PASSWORD, // cukup password-nya saja
});

// Optional: log status koneksi
redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

export default redis;
