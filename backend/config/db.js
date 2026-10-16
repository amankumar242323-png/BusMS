const { Pool } = require("pg");
require("dotenv").config();

let pool = null;
let activeConnectionLabel = "Default";

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

function getCandidateConfigs() {
  const candidates = [];

  if (process.env.DATABASE_URL) {
    const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
    if (parsed) {
      const originalHost = parsed.host.toLowerCase();
      const isRenderExternal = originalHost.includes(".render.com") && originalHost.startsWith("dpg-");

      // Candidate 1 (Priority on Render): Render Internal private network hostname
      if (isRenderExternal) {
        const internalHost = originalHost.replace(/\.[a-z0-9-]+-postgres\.render\.com$/, "");
        candidates.push({
          label: `Render-Internal (${internalHost}, No SSL)`,
          config: {
            user: parsed.user,
            password: parsed.password,
            host: internalHost,
            port: parsed.port,
            database: parsed.database,
            ssl: false,
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            max: 10,
          },
        });
      }

      // Candidate 2: Direct connection with SSL and SNI servername
      candidates.push({
        label: `Direct-External (${parsed.host}, SSL+SNI)`,
        config: {
          user: parsed.user,
          password: parsed.password,
          host: parsed.host,
          port: parsed.port,
          database: parsed.database,
          ssl: {
            rejectUnauthorized: false,
            servername: parsed.host,
          },
          connectionTimeoutMillis: 8000,
          idleTimeoutMillis: 30000,
          max: 10,
        },
      });

      // Candidate 3: Direct connection without SSL
      candidates.push({
        label: `Direct-External (${parsed.host}, No SSL)`,
        config: {
          user: parsed.user,
          password: parsed.password,
          host: parsed.host,
          port: parsed.port,
          database: parsed.database,
          ssl: false,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          max: 10,
        },
      });

      // Candidate 4: Raw connectionString fallback
      candidates.push({
        label: `Raw-ConnectionString`,
        config: {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 8000,
          idleTimeoutMillis: 30000,
          max: 10,
        },
      });
    }
  }

  // Fallback candidate when DATABASE_URL is not set or local
  candidates.push({
    label: `Local/Env-Fallback (${process.env.DB_HOST || "localhost"})`,
    config: {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME || "bus_management",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    },
  });

  return candidates;
}

function initInitialPool() {
  const candidates = getCandidateConfigs();
  pool = new Pool(candidates[0].config);
  activeConnectionLabel = candidates[0].label;

  pool.on("error", (err) => {
    console.error(`❌ PostgreSQL Pool Error (${activeConnectionLabel}):`, err.message);
  });
}

initInitialPool();

const testAndFixDatabaseConnection = async () => {
  const candidates = getCandidateConfigs();
  const errors = [];

  for (const candidate of candidates) {
    console.log(`🔍 Testing DB connection profile: [${candidate.label}]...`);
    let testPool = null;
    try {
      testPool = new Pool(candidate.config);
      const client = await testPool.connect();
      const res = await client.query("SELECT current_database() AS db, current_user AS usr");
      client.release();

      console.log(
        `✅ PostgreSQL CONNECTED via [${candidate.label}]! Database: "${res.rows[0].db}", User: "${res.rows[0].usr}"`
      );

      // Successfully connected! Switch primary pool to this candidate
      try {
        await pool.end().catch(() => {});
      } catch {}

      pool = testPool;
      activeConnectionLabel = candidate.label;

      pool.on("error", (err) => {
        console.error(`❌ PostgreSQL Pool Error (${activeConnectionLabel}):`, err.message);
      });

      return {
        success: true,
        label: candidate.label,
        database: res.rows[0].db,
        user: res.rows[0].usr,
      };
    } catch (err) {
      console.warn(`⚠️ Profile [${candidate.label}] failed: ${err.message}`);
      errors.push({ label: candidate.label, error: err.message });
      if (testPool) {
        await testPool.end().catch(() => {});
      }
    }
  }

  console.error("❌ ALL database connection profiles failed!");
  return {
    success: false,
    errors,
  };
};

const db = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === "testAndFixDatabaseConnection") {
        return testAndFixDatabaseConnection;
      }
      if (prop === "getActiveConnectionLabel") {
        return () => activeConnectionLabel;
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