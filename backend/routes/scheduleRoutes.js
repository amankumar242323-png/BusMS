const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const scheduleSelect = `
  SELECT
    s.*,
    b.bus_number,
    b.bus_type,
    b.capacity,
    b.driver_name,
    COALESCE(
      ARRAY_AGG(DISTINCT ba.amenity) FILTER (WHERE ba.amenity IS NOT NULL),
      '{}'
    ) AS amenities,
    r.source,
    r.destination,
    r.distance,
    r.price_per_km,
    ROUND((r.distance * r.price_per_km)::numeric, 2) AS base_price,
    COALESCE(
      ARRAY_AGG(DISTINCT t.seat_number) FILTER (
        WHERE t.seat_number IS NOT NULL
        AND bk.status <> 'cancelled'
        AND t.ticket_status <> 'cancelled'
      ),
      '{}'
    ) AS booked_seats
  FROM schedule s
  JOIN bus b ON s.bus_id = b.bus_id
  JOIN route r ON s.route_id = r.route_id
  LEFT JOIN bus_amenity ba ON ba.bus_id = b.bus_id
  LEFT JOIN booking bk ON bk.schedule_id = s.schedule_id
  LEFT JOIN ticket t ON t.booking_id = bk.booking_id
`;

// GET /api/schedules?source=&destination=&travel_date=
router.get('/', async (req, res) => {
  const { source, destination, travel_date } = req.query;
  try {
    let query = `
      ${scheduleSelect}
      WHERE s.status = 'active'
    `;
    const params = [];

    if (source) {
      params.push(source);
      query += ` AND LOWER(r.source) = LOWER($${params.length})`;
    }
    if (destination) {
      params.push(destination);
      query += ` AND LOWER(r.destination) = LOWER($${params.length})`;
    }
    if (travel_date) {
      params.push(travel_date);
      query += ` AND s.travel_date = $${params.length}`;
    } else {
      query += ` AND s.travel_date >= CURRENT_DATE`;
    }

    query += `
      GROUP BY s.schedule_id, b.bus_id, r.route_id
      ORDER BY s.departure_time ASC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// GET /api/schedules/admin/all
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      ${scheduleSelect}
      GROUP BY s.schedule_id, b.bus_id, r.route_id
      ORDER BY s.travel_date ASC, s.departure_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// GET /api/schedules/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
        ${scheduleSelect}
        WHERE s.schedule_id = $1
        GROUP BY s.schedule_id, b.bus_id, r.route_id
      `,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// POST /api/schedules  (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { bus_id, route_id, travel_date, departure_time, arrival_time } = req.body;
  if (!bus_id || !route_id || !travel_date || !departure_time || !arrival_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const busResult = await pool.query('SELECT capacity FROM bus WHERE bus_id = $1', [bus_id]);
    if (busResult.rows.length === 0) return res.status(404).json({ error: 'Bus not found' });
    const capacity = busResult.rows[0].capacity;

    const result = await pool.query(
      `INSERT INTO schedule (bus_id, route_id, travel_date, departure_time, arrival_time, available_seats)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [bus_id, route_id, travel_date, departure_time, arrival_time, capacity]
    );

    const created = await pool.query(
      `
        ${scheduleSelect}
        WHERE s.schedule_id = $1
        GROUP BY s.schedule_id, b.bus_id, r.route_id
      `,
      [result.rows[0].schedule_id]
    );

    res.status(201).json(created.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// PUT /api/schedules/:id  (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { bus_id, route_id, travel_date, departure_time, arrival_time, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE schedule
       SET bus_id = $1, route_id = $2, travel_date = $3, departure_time = $4, arrival_time = $5, status = $6
       WHERE schedule_id = $7 RETURNING *`,
      [bus_id, route_id, travel_date, departure_time, arrival_time, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });

    const updated = await pool.query(
      `
        ${scheduleSelect}
        WHERE s.schedule_id = $1
        GROUP BY s.schedule_id, b.bus_id, r.route_id
      `,
      [req.params.id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// DELETE /api/schedules/:id  (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM schedule WHERE schedule_id = $1', [req.params.id]);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

module.exports = router;
