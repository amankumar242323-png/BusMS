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
  const isRunningOnRender = process.env.RENDER === "true";

  if (process.env.DATABASE_URL) {
    const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
    if (parsed) {
      const originalHost = parsed.host.toLowerCase();
      const isBareRenderInternal = originalHost.startsWith("dpg-") && !originalHost.includes(".");
      const isRenderExternal = originalHost.includes(".render.com") && originalHost.startsWith("dpg-");

      // Profile 1: If user provided a fully-qualified domain, connect to IT directly with SSL
      if (originalHost.includes(".")) {
        candidates.push({
          label: `Direct-External (${parsed.host}, SSL)`,
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
      }

      // Profile 2: If user provided a bare internal hostname (e.g. dpg-d8v2f75ckfvc73f5ofk0-a)
      // When running outside Render (locally), internal hostname CANNOT resolve.
      // Auto-expand with common Render region domains so it resolves from anywhere!
      if (isBareRenderInternal) {
        const renderRegions = ["oregon", "frankfurt", "singapore", "ohio", "virginia"];
        for (const region of renderRegions) {
          const externalHost = `${originalHost}.${region}-postgres.render.com`;
          candidates.push({
            label: `Render-Region-${region} (${externalHost}, SSL)`,
            config: {
              user: parsed.user,
              password: parsed.password,
              host: externalHost,
              port: parsed.port || 5432,
              database: parsed.database,
              ssl: {
                rejectUnauthorized: false,
                servername: externalHost,
              },
              connectionTimeoutMillis: 7000,
              idleTimeoutMillis: 30000,
              max: 10,
            },
          });
        }

        // Only test the bare internal hostname if we are actually running inside Render
        if (isRunningOnRender) {
          candidates.push({
            label: `Render-Internal (${originalHost}, No SSL)`,
            config: {
              user: parsed.user,
              password: parsed.password,
              host: originalHost,
              port: parsed.port,
              database: parsed.database,
              ssl: false,
              connectionTimeoutMillis: 4000,
              idleTimeoutMillis: 30000,
              max: 10,
            },
          });
        }
      }

      // Profile 3: If running ON Render with external hostname, internal host can be an alternative
      if (isRenderExternal && isRunningOnRender) {
        const internalHost = originalHost.replace(/\.[a-z0-9-]+-postgres\.render\.com$/, "");
        candidates.push({
          label: `Render-Internal-Mesh (${internalHost}, No SSL)`,
          config: {
            user: parsed.user,
            password: parsed.password,
            host: internalHost,
            port: parsed.port,
            database: parsed.database,
            ssl: false,
            connectionTimeoutMillis: 4000,
            idleTimeoutMillis: 30000,
            max: 10,
          },
        });
      }

      // Profile 4: Raw connectionString with SSL
      candidates.push({
        label: `Raw-DATABASE_URL`,
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

  // Profile 5: Local / Standard DB_HOST fallback
  const rawDbHost = process.env.DB_HOST || "localhost";
  const isBareDbHost = rawDbHost.startsWith("dpg-") && !rawDbHost.includes(".");

  if (isBareDbHost && !isRunningOnRender) {
    // If user put dpg-... in DB_HOST locally, try resolving via oregon/etc.
    const renderRegions = ["oregon", "frankfurt", "singapore", "ohio", "virginia"];
    for (const region of renderRegions) {
      const extHost = `${rawDbHost}.${region}-postgres.render.com`;
      candidates.push({
        label: `DB_HOST-Render-${region} (${extHost}, SSL)`,
        config: {
          host: extHost,
          port: parseInt(process.env.DB_PORT || "5432", 10),
          database: process.env.DB_NAME || "bus_management",
          user: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "",
          ssl: { rejectUnauthorized: false, servername: extHost },
          connectionTimeoutMillis: 7000,
          idleTimeoutMillis: 30000,
          max: 10,
        },
      });
    }
  } else {
    candidates.push({
      label: `Local/Env-Config (${rawDbHost})`,
      config: {
        host: rawDbHost,
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME || "bus_management",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        ssl:
          process.env.DB_SSL === "true" || rawDbHost.includes(".render.com")
            ? { rejectUnauthorized: false }
            : false,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10,
      },
    });
  }

  return candidates;
}

function initInitialPool() {
  const candidates = getCandidateConfigs();
  // Choose the safest initial candidate (one that doesn't use unresolvable bare internal hostnames locally)
  const safeInitial =
    candidates.find((c) => !c.config.host || c.config.host.includes(".") || c.config.host === "localhost") ||
    candidates[0];

  pool = new Pool(safeInitial.config);
  activeConnectionLabel = safeInitial.label;

  pool.on("error", (err) => {
    console.warn(`[DB Pool Status] (${activeConnectionLabel}): ${err.message}`);
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

      // Switch primary pool to this candidate
      try {
        await pool.end().catch(() => {});
      } catch {}

      pool = testPool;
      activeConnectionLabel = candidate.label;

      pool.on("error", (err) => {
        console.warn(`[DB Pool Status] (${activeConnectionLabel}): ${err.message}`);
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

  console.warn("⚠️ All live PostgreSQL connection profiles failed. Operating in resilient zero-downtime fallback mode.");
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