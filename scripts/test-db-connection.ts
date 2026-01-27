import { db } from "../db/index";

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"));
    
    // 测试简单查询
    const result = await db.execute({
      sql: "SELECT NOW() as current_time, version() as version",
      args: [],
    });
    
    console.log("✅ Database connection successful!");
    console.log("Current time:", result.rows[0]?.current_time);
    console.log("PostgreSQL version:", result.rows[0]?.version);
    
    // 测试表是否存在
    const tablesResult = await db.execute({
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `,
      args: [],
    });
    
    console.log("\n📊 Available tables:");
    tablesResult.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.error("Details:", error);
    process.exit(1);
  }
}

testConnection();

