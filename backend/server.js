```javascript
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  syncCoreSequences,
  repairDemoPasswordHashes,
} = require("./utils/dbCompat");

const app = express();
const PORT = process.env.PORT || 5000;

// ====================== CORS ======================
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://bus-ms.vercel.app",
    ],
    credentials: true,
  })
);

// ====================== Middleware ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// ====================== API Routes ======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/buses", require("./routes/busRoutes"));
app.use("/api/routes", require("./routes/routeRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));

// ====================== Admin Dashboard ======================
app.get(
  "/api/admin/stats",
  require("./middleware/auth").authenticateToken,
  async (req, res) => {
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
        error: "Failed to fetch admin statistics",
      });
    }
  }
);

// ====================== Health ======================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ====================== Root ======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚍 Bus Management System Backend is Running",
    health: "/health",
  });
});

// ====================== Error Handler ======================
app.use(require("./middleware/errorHandler"));

// ====================== Start Server ======================
app.listen(PORT, async () => {
  console.log(`🚀 BusMS API running on port ${PORT}`);

  try {
    await syncCoreSequences();
    console.log("✅ Database sequences synchronized");
  } catch (err) {
    console.error("❌ Sequence sync failed:", err.message);
  }

  try {
    const updated = await repairDemoPasswordHashes();

    if (updated > 0) {
      console.log(`✅ Repaired ${updated} demo password hash(es)`);
    }
  } catch (err) {
    console.error("❌ Demo password repair failed:", err.message);
  }
});

module.exports = app;
```
