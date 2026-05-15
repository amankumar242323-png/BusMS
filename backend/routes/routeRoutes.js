const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET /api/routes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM route ORDER BY route_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// POST /api/routes  (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { source, destination, distance, price_per_km } = req.body;
  if (!source || !destination || !distance) {
    return res.status(400).json({ error: 'source, destination, and distance are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO route (source, destination, distance, price_per_km)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [source, destination, distance, price_per_km || 1.50]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add route' });
  }
});

// PUT /api/routes/:id  (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { source, destination, distance, price_per_km } = req.body;
  try {
    const result = await pool.query(
      `UPDATE route SET source=$1, destination=$2, distance=$3, price_per_km=$4
       WHERE route_id=$5 RETURNING *`,
      [source, destination, distance, price_per_km, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// DELETE /api/routes/:id  (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM route WHERE route_id = $1', [req.params.id]);
    res.json({ message: 'Route deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

module.exports = router;
