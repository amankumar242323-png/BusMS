const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { getCompatSchema, insertAlert, syncSequence } = require('../utils/dbCompat');

// POST /api/bookings
router.post('/', authenticateToken, async (req, res) => {
  const { schedule_id, seats_booked, seat_numbers } = req.body;
  const passenger_id = req.user.userId;

  if (!schedule_id || !seats_booked) {
    return res.status(400).json({ error: 'schedule_id and seats_booked are required' });
  }

  const requestedSeats = Array.isArray(seat_numbers)
    ? seat_numbers.map((seat) => parseInt(seat, 10)).filter((seat) => Number.isInteger(seat) && seat > 0)
    : [];

  if (requestedSeats.length > 0 && requestedSeats.length !== seats_booked) {
    return res.status(400).json({ error: 'Seat selection is invalid' });
  }

  if (new Set(requestedSeats).size !== requestedSeats.length) {
    return res.status(400).json({ error: 'Duplicate seat numbers are not allowed' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the schedule row
    const schedResult = await client.query(
      `SELECT s.*, r.distance, r.price_per_km
       FROM schedule s
       JOIN route r ON s.route_id = r.route_id
       WHERE s.schedule_id = $1 FOR UPDATE`,
      [schedule_id]
    );

    if (schedResult.rows.length === 0) throw new Error('Schedule not found');
    const schedule = schedResult.rows[0];

    if (schedule.available_seats < seats_booked) {
      throw new Error(`Only ${schedule.available_seats} seat(s) available`);
    }

    const occupiedSeatsResult = await client.query(
      `SELECT t.seat_number
       FROM booking b
       JOIN ticket t ON t.booking_id = b.booking_id
       WHERE b.schedule_id = $1
         AND b.status <> 'cancelled'
         AND t.ticket_status <> 'cancelled'`,
      [schedule_id]
    );

    const occupiedSeats = new Set(occupiedSeatsResult.rows.map((row) => row.seat_number));
    const conflictingSeat = requestedSeats.find((seat) => occupiedSeats.has(seat));
    if (conflictingSeat) {
      throw new Error(`Seat ${conflictingSeat} is already booked`);
    }

    const total_amount = parseFloat((schedule.distance * schedule.price_per_km * seats_booked).toFixed(2));

    // Create booking
    await syncSequence(client, 'booking', 'booking_id');
    const bookingResult = await client.query(
      `INSERT INTO booking (passenger_id, schedule_id, seats_booked, total_amount)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [passenger_id, schedule_id, seats_booked, total_amount]
    );
    const booking = bookingResult.rows[0];

    // Create one ticket per seat
    const seatNums = requestedSeats.length === seats_booked
      ? requestedSeats
      : Array.from({ length: schedule.capacity }, (_, i) => i + 1)
          .filter((seat) => !occupiedSeats.has(seat))
          .slice(0, seats_booked);

    const tickets = [];
    for (const seat of seatNums) {
      await syncSequence(client, 'ticket', 'ticket_id');
      const t = await client.query(
        `INSERT INTO ticket (booking_id, seat_number) VALUES ($1, $2) RETURNING *`,
        [booking.booking_id, seat]
      );
      tickets.push(t.rows[0]);
    }

    // Decrement available seats
    await client.query(
      `UPDATE schedule SET available_seats = available_seats - $1 WHERE schedule_id = $2`,
      [seats_booked, schedule_id]
    );

    // Notification
    await insertAlert(
      client,
      passenger_id,
      `Booking #${booking.booking_id} created! ${seats_booked} seat(s) reserved. Complete payment to confirm.`,
      'Booking Created'
    );

    await client.query('COMMIT');
    res.status(201).json({ booking, tickets });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message || 'Booking failed' });
  } finally {
    client.release();
  }
});

// GET /api/bookings/me  (current user's bookings)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.*,
         s.travel_date, s.departure_time, s.arrival_time,
         bus.bus_number, bus.bus_type, bus.driver_name,
         r.source, r.destination, r.distance,
         p.payment_status, p.payment_method, p.transaction_id,
         json_agg(
           json_build_object(
             'ticket_id', t.ticket_id,
             'seat_number', t.seat_number,
             'ticket_status', t.ticket_status
           )
         ) FILTER (WHERE t.ticket_id IS NOT NULL) AS tickets
       FROM booking b
       JOIN schedule s ON b.schedule_id = s.schedule_id
       JOIN bus ON s.bus_id = bus.bus_id
       JOIN route r ON s.route_id = r.route_id
       LEFT JOIN payment p ON b.booking_id = p.booking_id
       LEFT JOIN ticket t ON b.booking_id = t.booking_id
       WHERE b.passenger_id = $1
       GROUP BY b.booking_id, s.travel_date, s.departure_time, s.arrival_time,
                bus.bus_number, bus.bus_type, bus.driver_name,
                r.source, r.destination, r.distance,
                p.payment_status, p.payment_method, p.transaction_id
       ORDER BY b.booking_date DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/admin/all  (Admin)
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const schema = await getCompatSchema();
    const result = await pool.query(
      `SELECT b.*, u.name AS passenger_name, u.email,
              s.travel_date, bus.bus_number, r.source, r.destination,
              p.payment_status
       FROM booking b
       JOIN users u ON b.passenger_id = u.${schema.userIdColumn}
       JOIN schedule s ON b.schedule_id = s.schedule_id
       JOIN bus ON s.bus_id = bus.bus_id
       JOIN route r ON s.route_id = r.route_id
       LEFT JOIN payment p ON b.booking_id = p.booking_id
       ORDER BY b.booking_date DESC
       LIMIT 200`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all bookings' });
  }
});

// GET /api/bookings/:userId  (admin or own)
router.get('/:userId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId, 10)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const result = await pool.query(
      `SELECT b.*, s.travel_date, s.departure_time, s.arrival_time,
              bus.bus_number, bus.bus_type, r.source, r.destination,
              p.payment_status
       FROM booking b
       JOIN schedule s ON b.schedule_id = s.schedule_id
       JOIN bus ON s.bus_id = bus.bus_id
       JOIN route r ON s.route_id = r.route_id
       LEFT JOIN payment p ON b.booking_id = p.booking_id
       WHERE b.passenger_id = $1
       ORDER BY b.booking_date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// DELETE /api/bookings/:id  (cancel)
router.delete('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      `SELECT * FROM booking WHERE booking_id = $1 AND passenger_id = $2`,
      [req.params.id, req.user.userId]
    );
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');

    const booking = bookingResult.rows[0];
    if (booking.status === 'cancelled') throw new Error('Booking already cancelled');

    await client.query(`UPDATE booking SET status='cancelled' WHERE booking_id=$1`, [booking.booking_id]);
    await client.query(`UPDATE ticket SET ticket_status='cancelled' WHERE booking_id=$1`, [booking.booking_id]);
    await client.query(
      `UPDATE schedule SET available_seats = available_seats + $1 WHERE schedule_id = $2`,
      [booking.seats_booked, booking.schedule_id]
    );
    await insertAlert(
      client,
      req.user.userId,
      `Booking #${booking.booking_id} cancelled. Refund will be processed in 3-5 business days.`,
      'Booking Cancelled'
    );

    await client.query('COMMIT');
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
