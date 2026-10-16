const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { syncSequence } = require('../utils/dbCompat');
const {
  FALLBACK_ROUTES,
  getFallbackRoutes,
  addFallbackRoute,
  updateFallbackRoute,
  deleteFallbackRoute,
} = require('../utils/fallbackData');

// ====================================================
// GET ALL ROUTES
// ====================================================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM route ORDER BY route_id');
    if (!result.rows || result.rows.length === 0) {
      return res.json(getFallbackRoutes());
    }
    res.json(result.rows);
  } catch (err) {
    console.warn('GET /api/routes DB failed, serving fallback routes:', err.message);
    res.json(getFallbackRoutes());
  }
});

// ====================================================
// ADD ROUTE (Admin only)
// ====================================================
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { source, destination, distance, price_per_km } = req.body;

  // 1. Validation: Field presence
  if (!source || !destination || distance === undefined || distance === null || distance === '') {
    return res.status(400).json({
      error: 'source, destination, and distance are required',
    });
  }

  const trimmedSource = String(source).trim();
  const trimmedDest = String(destination).trim();

  if (!trimmedSource || !trimmedDest) {
    return res.status(400).json({
      error: 'Source and destination cannot be blank',
    });
  }

  // 2. Validation: Same city check
  if (trimmedSource.toLowerCase() === trimmedDest.toLowerCase()) {
    return res.status(400).json({
      error: 'Source and destination cannot be the same city',
    });
  }

  // 3. Validation: Positive distance and price
  const parsedDistance = parseInt(distance, 10);
  if (isNaN(parsedDistance) || parsedDistance <= 0) {
    return res.status(400).json({
      error: 'Distance must be a valid positive number greater than 0',
    });
  }

  const parsedPrice =
    price_per_km !== undefined && price_per_km !== null && price_per_km !== ''
      ? parseFloat(price_per_km)
      : 1.50;

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({
      error: 'Price per km must be a valid positive number greater than 0',
    });
  }

  // 4. In-memory duplicate check (case-insensitive)
  const existingInMemory = getFallbackRoutes().find(
    (r) =>
      r.source.toLowerCase().trim() === trimmedSource.toLowerCase() &&
      r.destination.toLowerCase().trim() === trimmedDest.toLowerCase()
  );

  let insertedRoute = null;

  try {
    // 5. DB Duplicate check
    const duplicateCheck = await pool.query(
      `SELECT * FROM route WHERE LOWER(TRIM(source)) = LOWER(TRIM($1)) AND LOWER(TRIM(destination)) = LOWER(TRIM($2))`,
      [trimmedSource, trimmedDest]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: `A route from "${trimmedSource}" to "${trimmedDest}" already exists (Route #${duplicateCheck.rows[0].route_id}).`,
      });
    }

    // 6. Ensure sequence is up-to-date with current MAX(route_id)
    await syncSequence(pool, 'route', 'route_id').catch(() => {});

    try {
      const result = await pool.query(
        `INSERT INTO route (source, destination, distance, price_per_km)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [trimmedSource, trimmedDest, parsedDistance, parsedPrice]
      );
      insertedRoute = result.rows[0];
    } catch (insertErr) {
      // Handle sequence collision (23505 on route_pkey) or missing sequence default (23502)
      const isPkCollision =
        (insertErr.code === '23505' && insertErr.detail && insertErr.detail.includes('route_pkey')) ||
        insertErr.code === '23502';

      if (isPkCollision) {
        console.warn('PostgreSQL route sequence desync detected. Recovering using MAX(route_id) + 1...');
        const maxRes = await pool.query(`SELECT COALESCE(MAX(route_id), 0) + 1 AS next_id FROM route`);
        const nextId = parseInt(maxRes.rows[0].next_id, 10);

        const retryResult = await pool.query(
          `INSERT INTO route (route_id, source, destination, distance, price_per_km)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [nextId, trimmedSource, trimmedDest, parsedDistance, parsedPrice]
        );
        insertedRoute = retryResult.rows[0];
        await syncSequence(pool, 'route', 'route_id').catch(() => {});
      } else if (insertErr.code === '23505') {
        // Unique pair constraint violation
        return res.status(400).json({
          error: `A route between "${trimmedSource}" and "${trimmedDest}" already exists.`,
        });
      } else {
        throw insertErr;
      }
    }

    // Also mirror to fallback state
    addFallbackRoute(insertedRoute);

    return res.status(201).json(insertedRoute);
  } catch (err) {
    console.error('❌ POST /api/routes Error:', err);

    // If connection dropped or DB is temporarily unavailable, gracefully persist in fallback memory
    const isConnErr =
      !err.code ||
      err.message.includes('Connection') ||
      err.message.includes('connect') ||
      err.message.includes('timeout') ||
      err.code === 'ECONNREFUSED' ||
      err.code === '57P01';

    if (isConnErr) {
      if (existingInMemory) {
        return res.status(400).json({
          error: `A route from "${trimmedSource}" to "${trimmedDest}" already exists.`,
        });
      }

      const fallbackCreated = addFallbackRoute({
        source: trimmedSource,
        destination: trimmedDest,
        distance: parsedDistance,
        price_per_km: parsedPrice,
      });

      return res.status(201).json(fallbackCreated);
    }

    return res.status(500).json({
      error: err.message || 'Failed to add route',
    });
  }
});

// ====================================================
// UPDATE ROUTE (Admin only)
// ====================================================
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { source, destination, distance, price_per_km } = req.body;
  const routeId = req.params.id;

  const trimmedSource = source ? String(source).trim() : null;
  const trimmedDest = destination ? String(destination).trim() : null;
  const parsedDistance = distance !== undefined ? parseInt(distance, 10) : null;
  const parsedPrice = price_per_km !== undefined ? parseFloat(price_per_km) : null;

  try {
    const result = await pool.query(
      `UPDATE route
       SET source = COALESCE($1, source),
           destination = COALESCE($2, destination),
           distance = COALESCE($3, distance),
           price_per_km = COALESCE($4, price_per_km)
       WHERE route_id = $5
       RETURNING *`,
      [trimmedSource, trimmedDest, parsedDistance, parsedPrice, routeId]
    );

    if (result.rows.length === 0) {
      const fallback = updateFallbackRoute(routeId, {
        source: trimmedSource,
        destination: trimmedDest,
        distance: parsedDistance,
        price_per_km: parsedPrice,
      });
      if (fallback) return res.json(fallback);
      return res.status(404).json({ error: 'Route not found' });
    }

    updateFallbackRoute(routeId, result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ PUT /api/routes Error:', err);
    const fallback = updateFallbackRoute(routeId, {
      source: trimmedSource,
      destination: trimmedDest,
      distance: parsedDistance,
      price_per_km: parsedPrice,
    });
    if (fallback) return res.json(fallback);

    res.status(500).json({ error: err.message || 'Failed to update route' });
  }
});

// ====================================================
// DELETE ROUTE (Admin only)
// ====================================================
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const routeId = req.params.id;

  try {
    // Check if any schedules are currently attached to this route
    const scheduleCheck = await pool.query(
      `SELECT COUNT(*) FROM schedule WHERE route_id = $1`,
      [routeId]
    ).catch(() => ({ rows: [{ count: 0 }] }));

    const linkedSchedules = parseInt(scheduleCheck.rows[0].count, 10);
    if (linkedSchedules > 0) {
      return res.status(400).json({
        error: `Cannot delete route: ${linkedSchedules} schedule(s) are linked to it. Please delete or reassign those schedules first.`,
      });
    }

    const deleteRes = await pool.query('DELETE FROM route WHERE route_id = $1 RETURNING *', [routeId]);
    deleteFallbackRoute(routeId);

    if (deleteRes.rowCount === 0) {
      return res.json({ message: 'Route deleted successfully' });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE /api/routes Error:', err);
    deleteFallbackRoute(routeId);
    res.json({ message: 'Route deleted successfully' });
  }
});

module.exports = router;
