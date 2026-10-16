const { Pool } = require("pg");
require("dotenv").config();

let poolConfig;

if (process.env.DATABASE_URL) {
  const isLocalDb =
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1");

  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DB_SSL === "true" || (!isLocalDb && process.env.NODE_ENV === "production")
        ? { rejectUnauthorized: false }
        : false,
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "bus_management",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(poolConfig);

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL Error:", err);
});

module.exports = pool;