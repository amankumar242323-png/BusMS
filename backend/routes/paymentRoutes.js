const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { insertAlert, syncSequence } = require('../utils/dbCompat');

// POST /api/payments
router.post('/', authenticateToken, async (req, res) => {
  const { booking_id, payment_method } = req.body;

  if (!booking_id || !payment_method) {
    return res.status(400).json({ error: 'booking_id and payment_method are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      `SELECT * FROM booking WHERE booking_id = $1 AND passenger_id = $2 FOR UPDATE`,
      [booking_id, req.user.userId]
    );
    if (bookingResult.rows.length === 0) throw new Error('Booking not found');
    const booking = bookingResult.rows[0];

    if (booking.status === 'cancelled') throw new Error('Cannot pay for a cancelled booking');

    const paymentRows = await client.query(
      `SELECT * FROM payment WHERE booking_id = $1 ORDER BY payment_date DESC, payment_id DESC FOR UPDATE`,
      [booking_id]
    );

    if (paymentRows.rows.some((row) => row.payment_status === 'success')) {
      throw new Error('Booking already paid');
    }

    const transaction_id = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    let payment;

    if (paymentRows.rows.length > 0) {
      const updatedPayment = await client.query(
        `UPDATE payment
         SET amount = $1,
             payment_method = $2,
             payment_status = 'success',
             transaction_id = $3,
             payment_date = NOW()
         WHERE payment_id = $4
         RETURNING *`,
        [booking.total_amount, payment_method, transaction_id, paymentRows.rows[0].payment_id]
      );
      payment = updatedPayment.rows[0];
    } else {
      await syncSequence(client, 'payment', 'payment_id');
      const insertedPayment = await client.query(
        `INSERT INTO payment (booking_id, amount, payment_method, payment_status, transaction_id)
         VALUES ($1, $2, $3, 'success', $4)
         RETURNING *`,
        [booking_id, booking.total_amount, payment_method, transaction_id]
      );
      payment = insertedPayment.rows[0];
    }

    await client.query(
      `UPDATE booking SET status = 'confirmed' WHERE booking_id = $1`,
      [booking_id]
    );

    await insertAlert(
      client,
      req.user.userId,
      `Payment of Rs ${booking.total_amount} received. TXN: ${transaction_id}. Your ticket is ready.`,
      'Payment Successful'
    );

    await client.query('COMMIT');
    res.status(201).json({
      payment,
      message: 'Payment successful',
      transaction_id,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/payments/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, b.seats_booked, b.booking_date,
              s.travel_date, bus.bus_number, r.source, r.destination
       FROM payment p
       JOIN booking b ON p.booking_id = b.booking_id
       JOIN schedule s ON b.schedule_id = s.schedule_id
       JOIN bus ON s.bus_id = bus.bus_id
       JOIN route r ON s.route_id = r.route_id
       WHERE b.passenger_id = $1
       ORDER BY p.payment_date DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;
