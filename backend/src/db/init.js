import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

dotenv.config();

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "hayzentech",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

async function initDatabase() {
  console.log("🚀 Initializing database...");

  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    await pool.query(schema);
    console.log("✅ Schema applied successfully");

    // Update the admin password with a proper hash
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `UPDATE profiles SET password_hash = $1 WHERE email = 'admin@hayzentech.com'`,
      [passwordHash]
    );
    console.log("✅ Admin user configured");

    console.log("\n📋 Default admin credentials:");
    console.log("   Email:    admin@hayzentech.com");
    console.log(`   Password: ${adminPassword}`);
    console.log("\n✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
