const { Pool } = require("pg");
require("dotenv").config();

let pool = null;

function sanitizeConnectionString(rawUrl) {
  try {
    const u = new URL(rawUrl);
    // Remove sslmode query param so it doesn't conflict with pg's ssl config object
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    return u.toString();
  } catch {
    return rawUrl;
  }
}

function buildPoolConfig(forceSsl) {
  if (process.env.DATABASE_URL) {
    let host = "";
    let isLocal = false;
    let isRenderInternal = false;

    try {
      const u = new URL(process.env.DATABASE_URL);
      host = u.hostname.toLowerCase();
      isLocal = host === "localhost" || host === "127.0.0.1";
      // Render internal database hosts: "dpg-xxxxxx-a" (no dot) or ends with ".internal"
      isRenderInternal = (!host.includes(".") && host.startsWith("dpg-")) || host.endsWith(".internal");
    } catch {
      isLocal =
        process.env.DATABASE_URL.includes("localhost") ||
        process.env.DATABASE_URL.includes("127.0.0.1");
      isRenderInternal = /@dpg-[a-z0-9]+-a[:\/]/.test(process.env.DATABASE_URL);
    }

    let useSsl;
    if (forceSsl !== undefined) {
      useSsl = forceSsl;
    } else if (process.env.DB_SSL === "true") {
      useSsl = true;
    } else if (
      process.env.DB_SSL === "false" ||
      isLocal ||
      isRenderInternal
    ) {
      // Render internal network or local does not use SSL
      useSsl = false;
    } else {
      // External cloud PostgreSQL (Render external, Supabase, Neon) requires SSL
      useSsl = true;
    }

    console.log(
      `🔌 PostgreSQL DB Target: host=${host || "DATABASE_URL"}, mode=${
        isRenderInternal ? "Render-Internal" : isLocal ? "Local" : "Cloud-External"
      }, SSL=${useSsl ? "ENABLED" : "DISABLED"}`
    );

    return {
      connectionString: sanitizeConnectionString(process.env.DATABASE_URL),
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10,
    };
  }

  // Fallback when DATABASE_URL is not set
  console.warn(
    `⚠️ DATABASE_URL is NOT set! Falling back to DB_HOST=${
      process.env.DB_HOST || "localhost"
    }, DB_NAME=${process.env.DB_NAME || "bus_management"}`
  );
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "bus_management",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
  };
}

function initPool(forceSsl) {
  const config = buildPoolConfig(forceSsl);
  pool = new Pool(config);

  pool.on("connect", () => {
    // Suppress noisy logs on high traffic
  });

  pool.on("error", (err) => {
    console.error("❌ PostgreSQL Pool Error:", err.message);
  });

  return pool;
}

// Initial pool creation
initPool();

// Proactive self-healing connection check
const testAndFixDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("✅ PostgreSQL verified: Connected and ready");
    return true;
  } catch (err) {
    console.warn(`⚠️ First DB connection failed (${err.message}). Attempting alternative SSL mode...`);

    // Toggle SSL mode and retry
    const currentSsl = Boolean(pool.options?.ssl);
    const retrySsl = !currentSsl;

    try {
      await pool.end().catch(() => {});
    } catch {}

    initPool(retrySsl);

    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      console.log(`✅ PostgreSQL self-healed: Connected successfully with SSL=${retrySsl ? "ENABLED" : "DISABLED"}`);
      return true;
    } catch (retryErr) {
      console.error(`❌ Database connection failed on both SSL modes: ${retryErr.message}`);
      console.error(`👉 Troubleshooting:
1. Verify if your Render PostgreSQL service is Active (free-tier databases expire after 30 days).
2. Check that DATABASE_URL in Render Web Service environment variables is correct.
3. If using Render Internal URL, ensure both services are in the same region.`);
      return false;
    }
  }
};

// Export proxy so consumers always route to the currently active pool
const db = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === "testAndFixDatabaseConnection") {
        return testAndFixDatabaseConnection;
      }
      const val = pool[prop];
      if (typeof val === "function") {
        return val.bind(pool);
      }
      return val;
    },
  }
);

module.exports = db;