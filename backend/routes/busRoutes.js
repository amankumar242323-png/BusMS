const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const busSelect = `
  SELECT
    b.*,
    COALESCE(
      ARRAY_AGG(ba.amenity ORDER BY ba.amenity) FILTER (WHERE ba.amenity IS NOT NULL),
      '{}'
    ) AS amenities
  FROM bus b
  LEFT JOIN bus_amenity ba ON ba.bus_id = b.bus_id
`;

const normalizeAmenities = (amenities) => (
  Array.isArray(amenities)
    ? [...new Set(amenities.map((item) => String(item).trim()).filter(Boolean))]
    : []
);

// GET /api/buses
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      ${busSelect}
      GROUP BY b.bus_id
      ORDER BY b.bus_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buses' });
  }
});

// GET /api/buses/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        ${busSelect}
        WHERE b.bus_id = $1
        GROUP BY b.bus_id
      `,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bus not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bus' });
  }
});

// POST /api/buses  (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { bus_number, bus_type, capacity, driver_name, amenities } = req.body;
  if (!bus_number || !bus_type || !capacity) {
    return res.status(400).json({ error: 'bus_number, bus_type, and capacity are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const createdBus = await client.query(
      `INSERT INTO bus (bus_number, bus_type, capacity, driver_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [bus_number, bus_type, capacity, driver_name || null]
    );

    const bus = createdBus.rows[0];
    for (const amenity of normalizeAmenities(amenities)) {
      await client.query(
        `INSERT INTO bus_amenity (bus_id, amenity) VALUES ($1, $2)`,
        [bus.bus_id, amenity]
      );
    }

    const result = await client.query(
      `
        ${busSelect}
        WHERE b.bus_id = $1
        GROUP BY b.bus_id
      `,
      [bus.bus_id]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to add bus' });
  } finally {
    client.release();
  }
});

// PUT /api/buses/:id  (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { bus_number, bus_type, capacity, driver_name, amenities } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updatedBus = await client.query(
      `UPDATE bus
       SET bus_number = $1, bus_type = $2, capacity = $3, driver_name = $4
       WHERE bus_id = $5
       RETURNING *`,
      [bus_number, bus_type, capacity, driver_name || null, req.params.id]
    );

    if (updatedBus.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Bus not found' });
    }

    await client.query(`DELETE FROM bus_amenity WHERE bus_id = $1`, [req.params.id]);

    for (const amenity of normalizeAmenities(amenities)) {
      await client.query(
        `INSERT INTO bus_amenity (bus_id, amenity) VALUES ($1, $2)`,
        [req.params.id, amenity]
      );
    }

    const result = await client.query(
      `
        ${busSelect}
        WHERE b.bus_id = $1
        GROUP BY b.bus_id
      `,
      [req.params.id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update bus' });
  } finally {
    client.release();
  }
});

// DELETE /api/buses/:id  (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM bus WHERE bus_id = $1', [req.params.id]);
    res.json({ message: 'Bus deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bus' });
  }
});

module.exports = router;
