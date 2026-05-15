const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getCompatSchema, insertAlert } = require('../utils/dbCompat');

const signAuthToken = (user) =>
  jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'busms_secret_key',
    { expiresIn: '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const schema = await getCompatSchema();
    const existing = await pool.query(`SELECT ${schema.userIdColumn} AS user_id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO users (name, email, phone, ${schema.passwordColumn})
      VALUES ($1, $2, $3, $4)
      RETURNING ${schema.userIdColumn} AS user_id, name, email, phone, role, created_at
    `, [name, email, phone || null, hashedPassword]);

    const user = result.rows[0];

    await insertAlert(pool, user.user_id, `Welcome to BusMS, ${user.name}! Start exploring bus routes today.`, 'Welcome');

    res.status(201).json({ token: signAuthToken(user), user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const schema = await getCompatSchema();
    const result = await pool.query(`
      SELECT *, ${schema.userIdColumn} AS user_id, ${schema.passwordColumn} AS password
      FROM users
      WHERE email = $1
    `, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const { password_hash: __, ...safeUser } = userWithoutPassword;
    res.json({ token: signAuthToken(user), user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
