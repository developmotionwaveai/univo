import "dotenv/config";
import { Pool } from "pg";

const testConnection = async () => {
  console.log("Testing database connection...");
  console.log("Connection string:", process.env.DATABASE_URL?.substring(0, 50) + "...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connected to database successfully!");

    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log("✅ Query successful! Current time:", result.rows[0].current_time);

    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("✅ Tables in database:", tablesResult.rows.map(r => r.table_name));

    client.release();
    await pool.end();
    console.log("\n✅ All tests passed!");
  } catch (error: any) {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

testConnection();
