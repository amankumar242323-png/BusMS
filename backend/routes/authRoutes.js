const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { getCompatSchema, insertAlert } = require('../utils/dbCompat');
const { registerFallbackUser, findFallbackUserByEmail } = require('../utils/fallbackData');

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

  const normalizedEmail = String(email).toLowerCase().trim();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const schema = await getCompatSchema();
    const existing = await pool.query(
      `SELECT ${schema.userIdColumn} AS user_id FROM users WHERE LOWER(email) = LOWER($1)`,
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Inspect columns in users table so we populate both password & password_hash if present
    const colsResult = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`
    ).catch(() => ({ rows: [] }));
    const cols = new Set(colsResult.rows.map((r) => r.column_name));

    const insertFields = ['name', 'email', 'phone'];
    const queryParams = [name, normalizedEmail, phone || null];

    if (cols.has('password')) {
      insertFields.push('password');
      queryParams.push(hashedPassword);
    }
    if (cols.has('password_hash')) {
      insertFields.push('password_hash');
      queryParams.push(hashedPassword);
    }
    if (!cols.has('password') && !cols.has('password_hash')) {
      insertFields.push(schema.passwordColumn || 'password');
      queryParams.push(hashedPassword);
    }

    insertFields.push('role');
    queryParams.push('passenger');

    const placeholders = queryParams.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(`
      INSERT INTO users (${insertFields.join(', ')})
      VALUES (${placeholders})
      RETURNING ${schema.userIdColumn} AS user_id, name, email, phone, role, created_at
    `, queryParams);

    const user = result.rows[0];
    await insertAlert(pool, user.user_id, `Welcome to BusMS, ${user.name}! Start exploring bus routes today.`, 'Welcome').catch(() => {});

    // Sync in fallback store for session consistency
    registerFallbackUser(user.name, user.email, user.phone, hashedPassword, user.user_id, user.role);

    return res.status(201).json({ token: signAuthToken(user), user });
  } catch (err) {
    console.warn('Register DB query failed, falling back to zero-downtime user store:', err.message);

    if (err.message && err.message.toLowerCase().includes('already registered')) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingFallback = findFallbackUserByEmail(normalizedEmail);
    if (existingFallback) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const fallbackUser = registerFallbackUser(name, normalizedEmail, phone, hashedPassword, null, 'passenger');
    return res.status(201).json({ token: signAuthToken(fallbackUser), user: fallbackUser });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  try {
    const schema = await getCompatSchema();
    const result = await pool.query(`
      SELECT *, ${schema.userIdColumn} AS user_id
      FROM users
      WHERE LOWER(email) = LOWER($1)
    `, [normalizedEmail]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const pwd = user.password || user.password_hash;
      const isValid = pwd ? await bcrypt.compare(password, pwd) : false;
      if (isValid) {
        const { password: _, password_hash: __, ...safeUser } = user;
        return res.json({ token: signAuthToken(safeUser), user: safeUser });
      }
    }
  } catch (err) {
    console.warn('Login DB query failed:', err.message);
  }

  // Check fallback user store (including demo accounts & runtime registered users)
  const fallbackUser = findFallbackUserByEmail(normalizedEmail);
  if (fallbackUser) {
    const isValid = await bcrypt.compare(password, fallbackUser.password);
    if (isValid) {
      const { password: _, password_hash: __, ...safeUser } = fallbackUser;
      return res.json({ token: signAuthToken(safeUser), user: safeUser });
    }
  }

  res.status(401).json({ error: 'Invalid email or password' });
});

module.exports = router;
