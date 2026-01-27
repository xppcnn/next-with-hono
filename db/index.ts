import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 连接池配置
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间（30秒）
  connectionTimeoutMillis: 10000, // 连接超时时间（10秒，本地开发可能需要更长时间）
  // 本地开发时可能需要禁用 SSL
  ...(process.env.NODE_ENV === 'development' && process.env.DATABASE_URL?.includes('localhost') 
    ? { ssl: false } 
    : {}),
});

// 监听连接错误
pool.on("error", (err) => {
  console.error("❌ Database pool error:", err.message);
});

// 测试连接（异步，不阻塞启动）
pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("✅ Database connection successful:", result.rows[0].now);
  })
  .catch((err) => {
    console.error("❌ Database connection failed:");
    console.error("  Error:", err.message);
    console.error("  Code:", err.code);
    const dbUrl = process.env.DATABASE_URL || "";
    // 隐藏密码显示连接字符串
    const safeUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
    console.error("  DATABASE_URL:", safeUrl);
  });

export const db = drizzle(pool, { schema });
