const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { getCompatSchema } = require('../utils/dbCompat');

// GET /api/alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const schema = await getCompatSchema();
    if (schema.usesPassengerAlerts) {
      const result = await pool.query(
        `SELECT * FROM alerts WHERE passenger_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [req.user.userId]
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      `SELECT ${schema.alertIdColumn} AS alert_id, title, message, type, is_read, created_at
       FROM alerts
       ORDER BY created_at DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// PUT /api/alerts/:id/read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const schema = await getCompatSchema();
    if (schema.usesPassengerAlerts) {
      await pool.query(
        `UPDATE alerts SET status='read' WHERE alert_id=$1 AND passenger_id=$2`,
        [req.params.id, req.user.userId]
      );
    } else {
      await pool.query(
        `UPDATE alerts SET is_read = true WHERE id = $1`,
        [req.params.id]
      );
    }
    res.json({ message: 'Alert marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// PUT /api/alerts/read-all
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const schema = await getCompatSchema();
    if (schema.usesPassengerAlerts) {
      await pool.query(
        `UPDATE alerts SET status='read' WHERE passenger_id=$1`,
        [req.user.userId]
      );
    } else {
      await pool.query(`UPDATE alerts SET is_read = true WHERE is_read = false`);
    }
    res.json({ message: 'All alerts marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alerts' });
  }
});

module.exports = router;
