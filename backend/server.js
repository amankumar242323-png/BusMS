const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { syncCoreSequences, repairDemoPasswordHashes } = require('./utils/dbCompat');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '"https://busms-backend.onrender.com"',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method}  ${req.path}`);
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));

app.get('/api/admin/stats', require('./middleware/auth').authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const pool = require('./config/db');

  try {
    const [users, buses, bookings, revenue] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'passenger'`),
      pool.query(`SELECT COUNT(*) FROM bus`),
      pool.query(`SELECT COUNT(*) FROM booking`),
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payment WHERE payment_status = 'success'`),
    ]);

    res.json({
      totalUsers: parseInt(users.rows[0].count, 10),
      totalBuses: parseInt(buses.rows[0].count, 10),
      totalBookings: parseInt(bookings.rows[0].count, 10),
      totalRevenue: parseFloat(revenue.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => {
  console.log(`BusMS API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);

  syncCoreSequences().then(() => {
    console.log('Database sequences synchronized');
  }).catch((err) => {
    console.error('Sequence sync failed:', err.message);
  });

  repairDemoPasswordHashes().then((updatedRows) => {
    if (updatedRows > 0) {
      console.log(`Repaired ${updatedRows} demo user password hash(es)`);
    }
  }).catch((err) => {
    console.error('Demo password repair failed:', err.message);
  });
});

module.exports = app;
