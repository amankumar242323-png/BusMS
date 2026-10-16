const { Pool } = require("pg");
require("dotenv").config();

let pool = null;

function parseDatabaseUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    return {
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      host: u.hostname,
      port: parseInt(u.port || "5432", 10),
      database: decodeURIComponent(u.pathname.replace(/^\//, "")),
    };
  } catch {
    return null;
  }
}

function buildPoolConfig(sslModeOverride) {
  if (process.env.DATABASE_URL) {
    let host = "";
    let isLocal = false;
    let isRenderInternal = false;

    const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
    if (parsed) {
      host = parsed.host.toLowerCase();
    } else {
      host = (process.env.DATABASE_URL.split("@")[1] || "").split("/")[0].split(":")[0].toLowerCase();
    }

    isLocal = host === "localhost" || host === "127.0.0.1";
    // Render internal hostnames: "dpg-xxxxxx-a" without dots or ends with .internal
    isRenderInternal = (!host.includes(".") && host.startsWith("dpg-")) || host.endsWith(".internal");

    let useSsl;
    if (sslModeOverride !== undefined) {
      useSsl = sslModeOverride;
    } else if (process.env.DB_SSL === "true") {
      useSsl = true;
    } else if (process.env.DB_SSL === "false" || isLocal || isRenderInternal) {
      useSsl = false;
    } else {
      // Cloud external databases (e.g. oregon-postgres.render.com, Supabase, Neon) ALWAYS require SSL
      useSsl = true;
    }

    const sslConfig = useSsl
      ? {
          rejectUnauthorized: false,
          servername: host, // REQUIRED: SNI header for Render/Cloud PostgreSQL proxies
        }
      : false;

    console.log(
      `🔌 PostgreSQL DB Target: host=${host || "DATABASE_URL"}, mode=${
        isRenderInternal ? "Render-Internal" : isLocal ? "Local" : "Cloud-External"
      }, SSL=${useSsl ? "ENABLED (with SNI)" : "DISABLED"}`
    );

    if (parsed) {
      return {
        user: parsed.user,
        password: parsed.password,
        host: parsed.host,
        port: parsed.port,
        database: parsed.database,
        ssl: sslConfig,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000,
        max: 10,
      };
    }

    return {
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
      connectionTimeoutMillis: 15000,
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
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    max: 10,
  };
}

function initPool(forceSsl) {
  const config = buildPoolConfig(forceSsl);
  pool = new Pool(config);

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
    const result = await client.query("SELECT current_database(), current_user");
    client.release();
    console.log(
      `✅ PostgreSQL verified: Connected to database "${result.rows[0].current_database}" as "${result.rows[0].current_user}"`
    );
    return true;
  } catch (err) {
    console.warn(`⚠️ First DB connection attempt failed (${err.message})`);

    // If it failed with "SSL/TLS required", force SSL=true with SNI
    if (err.message && err.message.includes("SSL/TLS required")) {
      console.log("🔄 Reconnecting with enforced SSL and SNI...");
      try {
        await pool.end().catch(() => {});
      } catch {}
      initPool(true);
      try {
        const client = await pool.connect();
        const result = await client.query("SELECT current_database(), current_user");
        client.release();
        console.log(`✅ PostgreSQL connected: "${result.rows[0].current_database}"`);
        return true;
      } catch (e) {
        console.error("❌ Second attempt failed:", e.message);
      }
    } else if (err.message && err.message.includes("Connection terminated unexpectedly")) {
      console.log("🔄 Retrying with alternate TLS configuration...");
      try {
        await pool.end().catch(() => {});
      } catch {}
      initPool(false);
      try {
        const client = await pool.connect();
        const result = await client.query("SELECT current_database(), current_user");
        client.release();
        console.log(`✅ PostgreSQL connected: "${result.rows[0].current_database}"`);
        return true;
      } catch (e) {
        console.error("❌ Retry without SSL also failed:", e.message);
        // Switch back to SSL=true for cloud
        initPool(true);
      }
    }

    return false;
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