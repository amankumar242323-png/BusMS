const pool = require('../config/db');

let schemaPromise;
const BROKEN_DEMO_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y';
const FIXED_DEMO_HASH = '$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2';

const getCompatSchema = async () => {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const [userCols, alertCols] = await Promise.all([
        pool.query(
          `SELECT column_name
           FROM information_schema.columns
           WHERE table_name = 'users'`
        ),
        pool.query(
          `SELECT column_name
           FROM information_schema.columns
           WHERE table_name = 'alerts'`
        ),
      ]);

      const userColumnSet = new Set(userCols.rows.map((row) => row.column_name));
      const alertColumnSet = new Set(alertCols.rows.map((row) => row.column_name));

      return {
        userIdColumn: userColumnSet.has('user_id') ? 'user_id' : 'id',
        passwordColumn: userColumnSet.has('password') ? 'password' : 'password_hash',
        usesPassengerAlerts: alertColumnSet.has('passenger_id'),
        alertIdColumn: alertColumnSet.has('alert_id') ? 'alert_id' : 'id',
        alertStatusColumn: alertColumnSet.has('status') ? 'status' : 'is_read',
      };
    })();
  }

  return schemaPromise;
};

const insertAlert = async (db, userId, message, title = 'Notice', type = 'info') => {
  const schema = await getCompatSchema();

  if (schema.usesPassengerAlerts) {
    return db.query(
      `INSERT INTO alerts (passenger_id, message) VALUES ($1, $2)`,
      [userId, message]
    );
  }

  return db.query(
    `INSERT INTO alerts (title, message, type, is_read) VALUES ($1, $2, $3, $4)`,
    [title, message, type, false]
  );
};

const syncSequence = async (db, tableName, columnName) => {
  const sequenceResult = await db.query(
    `SELECT pg_get_serial_sequence($1, $2) AS seq`,
    [tableName, columnName]
  );
  const sequenceName = sequenceResult.rows[0]?.seq;

  if (!sequenceName) return;

  await db.query(
    `SELECT setval($1, COALESCE((SELECT MAX(${columnName}) FROM ${tableName}), 0) + 1, false)`,
    [sequenceName]
  );
};

const syncCoreSequences = async (db = pool) => {
  const sequenceTargets = [
    ['users', 'id'],
    ['users', 'user_id'],
    ['alerts', 'id'],
    ['alerts', 'alert_id'],
    ['booking', 'booking_id'],
    ['ticket', 'ticket_id'],
    ['payment', 'payment_id'],
    ['bus', 'bus_id'],
    ['route', 'route_id'],
    ['schedule', 'schedule_id'],
  ];

  for (const [tableName, columnName] of sequenceTargets) {
    try {
      await syncSequence(db, tableName, columnName);
    } catch (err) {
      if (err.code !== '42703' && err.code !== '42P01') {
        throw err;
      }
    }
  }
};

const repairDemoPasswordHashes = async (db = pool) => {
  const schema = await getCompatSchema();
  const result = await db.query(
    `UPDATE users
     SET ${schema.passwordColumn} = $1
     WHERE ${schema.passwordColumn} = $2`,
    [FIXED_DEMO_HASH, BROKEN_DEMO_HASH]
  );

  return result.rowCount;
};

module.exports = {
  getCompatSchema,
  insertAlert,
  syncSequence,
  syncCoreSequences,
  repairDemoPasswordHashes,
};
