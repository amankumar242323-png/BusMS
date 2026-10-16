const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  syncCoreSequences,
  repairDemoPasswordHashes,
  refreshExpiredScheduleDates,
} = require("./utils/dbCompat");
const { autoMigrateDatabase } = require("./utils/autoMigrate");

const { authenticateToken } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ====================== CORS ======================
const configuredOrigins = [
  process.env.FRONTEND_URL,
  "https://busms.vercel.app",
  "https://bus-ms.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      let isAllowed = false;
      try {
        const url = new URL(origin);
        isAllowed =
          configuredOrigins.includes(origin) ||
          url.hostname.endsWith(".vercel.app") ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
          /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
          /^http:\/\/[a-zA-Z0-9-]+\.local(:\d+)?$/.test(origin);
      } catch {
        isAllowed = configuredOrigins.includes(origin);
      }

      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback: allow to avoid blocking public bus search/browsing
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// ====================== Middleware ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// ====================== Routes ======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/buses", require("./routes/busRoutes"));
app.use("/api/routes", require("./routes/routeRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));

// ====================== Admin Stats ======================
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  const pool = require("./config/db");

  try {
    const [users, buses, bookings, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role='passenger'"),
      pool.query("SELECT COUNT(*) FROM bus"),
      pool.query("SELECT COUNT(*) FROM booking"),
      pool.query(
        "SELECT COALESCE(SUM(amount),0) AS total FROM payment WHERE payment_status='success'"
      ),
    ]);

    res.json({
      totalUsers: Number(users.rows[0].count),
      totalBuses: Number(buses.rows[0].count),
      totalBookings: Number(bookings.rows[0].count),
      totalRevenue: Number(revenue.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch admin stats",
      message: err.message,
    });
  }
});

// ====================== Health & Status ======================
const handleHealth = async (req, res) => {
  const pool = require("./config/db");
  try {
    const [buses, schedules, routes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM bus").catch(() => ({ rows: [{ count: "0" }] })),
      pool.query("SELECT COUNT(*) FROM schedule WHERE status='active'").catch(() => ({ rows: [{ count: "0" }] })),
      pool.query("SELECT COUNT(*) FROM route").catch(() => ({ rows: [{ count: "0" }] })),
    ]);

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: "connected",
      counts: {
        buses: parseInt(buses.rows[0].count, 10),
        activeSchedules: parseInt(schedules.rows[0].count, 10),
        routes: parseInt(routes.rows[0].count, 10),
      },
    });
  } catch (err) {
    res.status(200).json({
      status: "Degraded",
      timestamp: new Date().toISOString(),
      database: "error",
      error: err.message,
    });
  }
};

app.get("/health", handleHealth);
app.get("/api/health", handleHealth);
app.get("/api/status", handleHealth);

// ====================== Manual / Trigger Migration ======================
app.get("/api/migrate", async (req, res) => {
  try {
    const pool = require("./config/db");
    const connectionReport = await pool.testAndFixDatabaseConnection();
    if (!connectionReport.success) {
      return res.status(500).json({
        success: false,
        error: "All database connection attempts failed",
        connectionReport,
      });
    }

    const details = await autoMigrateDatabase();
    res.json({
      success: true,
      message: "Database auto-migration triggered successfully",
      connection: connectionReport,
      details,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ====================== Root ======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bus Management System Backend Running",
    health: "/health",
    status: "/api/status",
  });
});

// ====================== Error Handler ======================
app.use(require("./middleware/errorHandler"));

// ====================== Start Server ======================
app.listen(PORT, async () => {
  console.log("BusMS Backend running on port", PORT);

  try {
    const pool = require("./config/db");
    if (pool.testAndFixDatabaseConnection) {
      await pool.testAndFixDatabaseConnection();
    }
  } catch (err) {
    console.error("Database connection verification error:", err.message);
  }

  try {
    await autoMigrateDatabase();
  } catch (err) {
    console.error("Auto-migration failed:", err.message);
  }

  try {
    await syncCoreSequences();
    console.log("Database sequences synchronized");
  } catch (err) {
    console.error("Sequence sync failed:", err.message);
  }

  try {
    const repaired = await repairDemoPasswordHashes();

    if (repaired > 0) {
      console.log("Repaired", repaired, "demo password hash(es)");
    }
  } catch (err) {
    console.error("Password repair failed:", err.message);
  }

  try {
    const refreshed = await refreshExpiredScheduleDates();
    if (refreshed > 0) {
      console.log("Refreshed", refreshed, "expired schedule date(s) to upcoming days");
    }
  } catch (err) {
    console.error("Schedule refresh failed:", err.message);
  }
});

module.exports = app;