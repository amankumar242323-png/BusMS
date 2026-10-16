const pool = require("../config/db");
const { syncCoreSequences, refreshExpiredScheduleDates } = require("./dbCompat");

// Password hash for "pass123":
const DEMO_PASSWORD_HASH = "$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2";

const safeQuery = async (db, label, sql) => {
  try {
    await db.query(sql);
  } catch (err) {
    console.warn(`[AutoMigrate Notice] ${label}:`, err.message);
  }
};

const autoMigrateDatabase = async (db = pool) => {
  try {
    console.log("🚀 Starting database auto-migration and verification...");

    // 1. Create Core Tables
    await safeQuery(
      db,
      "Create users table",
      `CREATE TABLE IF NOT EXISTS users (
        user_id    SERIAL PRIMARY KEY,
        name       VARCHAR(100)  NOT NULL,
        email      VARCHAR(100)  UNIQUE NOT NULL,
        phone      VARCHAR(15),
        password   VARCHAR(255)  NOT NULL,
        role       VARCHAR(20)   DEFAULT 'passenger',
        created_at TIMESTAMP     DEFAULT NOW()
      )`
    );

    await safeQuery(
      db,
      "Create bus table",
      `CREATE TABLE IF NOT EXISTS bus (
        bus_id      SERIAL PRIMARY KEY,
        bus_number  VARCHAR(50)  UNIQUE NOT NULL,
        bus_type    VARCHAR(50)  NOT NULL,
        capacity    INT          NOT NULL,
        driver_name VARCHAR(100),
        created_at  TIMESTAMP    DEFAULT NOW()
      )`
    );

    await safeQuery(
      db,
      "Create bus_amenity table",
      `CREATE TABLE IF NOT EXISTS bus_amenity (
        amenity_id  SERIAL PRIMARY KEY,
        bus_id      INT          NOT NULL REFERENCES bus(bus_id) ON DELETE CASCADE,
        amenity     VARCHAR(100) NOT NULL,
        UNIQUE (bus_id, amenity)
      )`
    );

    await safeQuery(
      db,
      "Create route table",
      `CREATE TABLE IF NOT EXISTS route (
        route_id     SERIAL PRIMARY KEY,
        source       VARCHAR(100)   NOT NULL,
        destination  VARCHAR(100)   NOT NULL,
        distance     INT            NOT NULL,
        price_per_km DECIMAL(6,2)   DEFAULT 1.50,
        created_at   TIMESTAMP      DEFAULT NOW()
      )`
    );

    await safeQuery(
      db,
      "Create schedule table",
      `CREATE TABLE IF NOT EXISTS schedule (
        schedule_id      SERIAL PRIMARY KEY,
        bus_id           INT REFERENCES bus(bus_id) ON DELETE CASCADE,
        route_id         INT REFERENCES route(route_id) ON DELETE CASCADE,
        travel_date      DATE         NOT NULL,
        departure_time   TIME         NOT NULL,
        arrival_time     TIME         NOT NULL,
        available_seats  INT,
        status           VARCHAR(30)  DEFAULT 'active',
        created_at       TIMESTAMP    DEFAULT NOW()
      )`
    );

    await safeQuery(
      db,
      "Create booking table",
      `CREATE TABLE IF NOT EXISTS booking (
        booking_id   SERIAL PRIMARY KEY,
        passenger_id INT,
        schedule_id  INT REFERENCES schedule(schedule_id) ON DELETE CASCADE,
        seats_booked INT         NOT NULL,
        booking_date TIMESTAMP   DEFAULT NOW(),
        total_amount DECIMAL(10,2),
        status       VARCHAR(30) DEFAULT 'pending'
      )`
    );

    await safeQuery(
      db,
      "Create ticket table",
      `CREATE TABLE IF NOT EXISTS ticket (
        ticket_id      SERIAL PRIMARY KEY,
        booking_id     INT REFERENCES booking(booking_id) ON DELETE CASCADE,
        seat_number    INT         NOT NULL,
        ticket_status  VARCHAR(50) DEFAULT 'active',
        created_at     TIMESTAMP   DEFAULT NOW()
      )`
    );

    await safeQuery(
      db,
      "Create payment table",
      `CREATE TABLE IF NOT EXISTS payment (
        payment_id      SERIAL PRIMARY KEY,
        booking_id      INT REFERENCES booking(booking_id) ON DELETE CASCADE,
        amount          DECIMAL(10,2) NOT NULL,
        payment_method  VARCHAR(50)   NOT NULL,
        payment_status  VARCHAR(50)   DEFAULT 'pending',
        transaction_id  VARCHAR(100),
        payment_date    TIMESTAMP     DEFAULT NOW()
      )`
    );

    await safeQuery(
      db,
      "Create alerts table",
      `CREATE TABLE IF NOT EXISTS alerts (
        alert_id     SERIAL PRIMARY KEY,
        passenger_id INT,
        message      TEXT         NOT NULL,
        status       VARCHAR(50)  DEFAULT 'unread',
        created_at   TIMESTAMP    DEFAULT NOW()
      )`
    );

    // 2. Compatibility check: ensure passenger_id and user_id columns exist in legacy tables
    await safeQuery(
      db,
      "Compatibility column backfill",
      `DO $$ 
      BEGIN 
        -- Ensure booking has passenger_id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking' AND column_name = 'passenger_id') THEN
            ALTER TABLE booking ADD COLUMN passenger_id INT;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking' AND column_name = 'user_id') THEN
              UPDATE booking SET passenger_id = user_id WHERE passenger_id IS NULL;
            END IF;
          END IF;
        END IF;

        -- Ensure alerts has passenger_id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'passenger_id') THEN
            ALTER TABLE alerts ADD COLUMN passenger_id INT;
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'user_id') THEN
              UPDATE alerts SET passenger_id = user_id WHERE passenger_id IS NULL;
            END IF;
          END IF;
        END IF;

        -- Ensure users has user_id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_id') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
              ALTER TABLE users ADD COLUMN user_id INT;
              UPDATE users SET user_id = id WHERE user_id IS NULL;
            END IF;
          END IF;
        END IF;
      END $$;`
    );

    // 3. Create Indexes safely
    await safeQuery(db, "idx_schedule_date", `CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(travel_date)`);
    await safeQuery(db, "idx_schedule_route", `CREATE INDEX IF NOT EXISTS idx_schedule_route ON schedule(route_id)`);
    await safeQuery(db, "idx_booking_passenger", `CREATE INDEX IF NOT EXISTS idx_booking_passenger ON booking(passenger_id)`);
    await safeQuery(db, "idx_alerts_passenger", `CREATE INDEX IF NOT EXISTS idx_alerts_passenger ON alerts(passenger_id)`);
    await safeQuery(db, "idx_route_cities", `CREATE INDEX IF NOT EXISTS idx_route_cities ON route(source, destination)`);
    await safeQuery(db, "idx_route_unique_pair", `CREATE UNIQUE INDEX IF NOT EXISTS idx_route_unique_pair ON route(source, destination)`);
    await safeQuery(db, "idx_bus_amenity_bus", `CREATE INDEX IF NOT EXISTS idx_bus_amenity_bus ON bus_amenity(bus_id)`);

    // 4. Seed Users if not present
    await safeQuery(
      db,
      "Seed users",
      `INSERT INTO users (name, email, phone, password, role) VALUES
        ('Admin User', 'admin@busms.com', '9999999999', '${DEMO_PASSWORD_HASH}', 'admin'),
        ('John Traveler', 'john@example.com', '9876543210', '${DEMO_PASSWORD_HASH}', 'passenger'),
        ('Jane Smith', 'jane@example.com', '9876543211', '${DEMO_PASSWORD_HASH}', 'passenger')
      ON CONFLICT (email) DO NOTHING;`
    );

    // 5. Seed Buses if table has 0 rows
    const busCountRes = await db.query("SELECT COUNT(*) FROM bus").catch(() => ({ rows: [{ count: "0" }] }));
    if (parseInt(busCountRes.rows[0].count, 10) === 0) {
      console.log("🚌 Seeding initial buses and amenities...");
      await safeQuery(
        db,
        "Seed buses",
        `INSERT INTO bus (bus_number, bus_type, capacity, driver_name) VALUES
          ('MH-12-AB-1234', 'AC Sleeper', 40, 'Radhika Verma'),
          ('MH-12-CD-5678', 'Non-AC Seater', 50, 'Shraiyansh Chaware'),
          ('MH-12-EF-9012', 'AC Seater', 45, 'Abhishek Yadav'),
          ('MH-12-GH-3456', 'Luxury Volvo', 35, 'Nandini Kanaujiya'),
          ('KA-01-TR-7788', 'AC Sleeper', 42, 'Mahesh Kumar'),
          ('DL-05-BS-2201', 'Luxury Volvo', 36, 'Simran Kaur'),
          ('TN-09-CH-8899', 'AC Seater', 44, 'Karthik Raman'),
          ('TS-11-HY-4412', 'Non-AC Seater', 48, 'Sandeep Reddy')
        ON CONFLICT (bus_number) DO NOTHING;`
      );

      await safeQuery(
        db,
        "Seed bus amenities",
        `INSERT INTO bus_amenity (bus_id, amenity) VALUES
          (1, 'AC'), (1, 'WiFi'), (1, 'Charging Point'), (1, 'Blanket'),
          (2, 'Fan'), (2, 'Cushion Seats'),
          (3, 'AC'), (3, 'Charging Point'),
          (4, 'AC'), (4, 'WiFi'), (4, 'Entertainment'), (4, 'Snacks'),
          (5, 'AC'), (5, 'WiFi'), (5, 'Charging Point'),
          (6, 'AC'), (6, 'Blanket'), (6, 'Snacks'),
          (7, 'AC'), (7, 'Charging Point'),
          (8, 'Fan'), (8, 'Charging Point')
        ON CONFLICT (bus_id, amenity) DO NOTHING;`
      );
    }

    // 6. Seed Routes if table has 0 rows
    const routeCountRes = await db.query("SELECT COUNT(*) FROM route").catch(() => ({ rows: [{ count: "0" }] }));
    if (parseInt(routeCountRes.rows[0].count, 10) === 0) {
      console.log("🛣️ Seeding initial routes...");
      await safeQuery(
        db,
        "Seed routes",
        `INSERT INTO route (source, destination, distance, price_per_km) VALUES
          ('Mumbai', 'Pune', 150, 2.00),
          ('Mumbai', 'Nashik', 167, 1.80),
          ('Pune', 'Bangalore', 838, 1.50),
          ('Mumbai', 'Goa', 590, 1.90),
          ('Delhi', 'Agra', 206, 1.70),
          ('Delhi', 'Jaipur', 281, 1.60),
          ('Chennai', 'Bangalore', 346, 1.75),
          ('Hyderabad', 'Mumbai', 711, 1.85),
          ('Pune', 'Mumbai', 150, 2.00),
          ('Nashik', 'Mumbai', 167, 1.80),
          ('Goa', 'Mumbai', 590, 1.90),
          ('Bangalore', 'Pune', 838, 1.50),
          ('Agra', 'Delhi', 206, 1.70),
          ('Jaipur', 'Delhi', 281, 1.60),
          ('Bangalore', 'Chennai', 346, 1.75),
          ('Mumbai', 'Hyderabad', 711, 1.85),
          ('Pune', 'Goa', 440, 1.95),
          ('Goa', 'Pune', 440, 1.95),
          ('Delhi', 'Mumbai', 1410, 1.65),
          ('Mumbai', 'Delhi', 1410, 1.65),
          ('Hyderabad', 'Bangalore', 570, 1.80),
          ('Bangalore', 'Hyderabad', 570, 1.80)
        ON CONFLICT (source, destination) DO NOTHING;`
      );
    }

    // 7. Seed Schedules if table has 0 rows
    const scheduleCountRes = await db.query("SELECT COUNT(*) FROM schedule").catch(() => ({ rows: [{ count: "0" }] }));
    if (parseInt(scheduleCountRes.rows[0].count, 10) === 0) {
      console.log("📅 Seeding initial schedules with upcoming dates...");
      await safeQuery(
        db,
        "Seed schedules",
        `INSERT INTO schedule (bus_id, route_id, travel_date, departure_time, arrival_time, available_seats, status)
        SELECT s.bus_id, r.route_id, s.travel_date, s.departure_time, s.arrival_time, s.available_seats, 'active'
        FROM (
          VALUES
            (1, 'Mumbai', 'Pune', CURRENT_DATE + 1, '06:00'::time, '09:30'::time, 38),
            (2, 'Mumbai', 'Pune', CURRENT_DATE + 1, '08:00'::time, '11:30'::time, 45),
            (3, 'Mumbai', 'Nashik', CURRENT_DATE + 1, '07:00'::time, '10:30'::time, 40),
            (4, 'Pune', 'Bangalore', CURRENT_DATE + 2, '20:00'::time, '08:00'::time, 30),
            (1, 'Mumbai', 'Goa', CURRENT_DATE + 2, '22:00'::time, '10:00'::time, 35),
            (5, 'Delhi', 'Agra', CURRENT_DATE + 1, '05:45'::time, '09:15'::time, 40),
            (6, 'Delhi', 'Jaipur', CURRENT_DATE + 1, '07:30'::time, '12:45'::time, 32),
            (7, 'Chennai', 'Bangalore', CURRENT_DATE + 1, '06:30'::time, '12:15'::time, 39),
            (8, 'Hyderabad', 'Mumbai', CURRENT_DATE + 2, '19:30'::time, '08:30'::time, 44),
            (5, 'Pune', 'Mumbai', CURRENT_DATE + 2, '06:15'::time, '09:45'::time, 37),
            (6, 'Nashik', 'Mumbai', CURRENT_DATE + 2, '08:10'::time, '11:30'::time, 30),
            (7, 'Goa', 'Mumbai', CURRENT_DATE + 3, '18:00'::time, '06:30'::time, 34),
            (8, 'Bangalore', 'Pune', CURRENT_DATE + 3, '19:45'::time, '08:15'::time, 41),
            (2, 'Agra', 'Delhi', CURRENT_DATE + 2, '06:00'::time, '09:25'::time, 43),
            (3, 'Jaipur', 'Delhi', CURRENT_DATE + 2, '16:00'::time, '21:15'::time, 39),
            (4, 'Bangalore', 'Chennai', CURRENT_DATE + 2, '14:00'::time, '19:45'::time, 28),
            (1, 'Mumbai', 'Hyderabad', CURRENT_DATE + 3, '20:30'::time, '09:00'::time, 35),
            (5, 'Pune', 'Goa', CURRENT_DATE + 3, '23:00'::time, '08:30'::time, 40),
            (6, 'Goa', 'Pune', CURRENT_DATE + 4, '21:30'::time, '07:00'::time, 31),
            (7, 'Delhi', 'Mumbai', CURRENT_DATE + 4, '18:30'::time, '18:00'::time, 42),
            (8, 'Mumbai', 'Delhi', CURRENT_DATE + 5, '17:45'::time, '17:15'::time, 43),
            (3, 'Hyderabad', 'Bangalore', CURRENT_DATE + 3, '07:00'::time, '16:00'::time, 38),
            (4, 'Bangalore', 'Hyderabad', CURRENT_DATE + 4, '06:45'::time, '15:30'::time, 29)
        ) AS s(bus_id, source, destination, travel_date, departure_time, arrival_time, available_seats)
        JOIN route r
          ON r.source = s.source
         AND r.destination = s.destination
        WHERE NOT EXISTS (
          SELECT 1 FROM schedule ex
          WHERE ex.bus_id = s.bus_id AND ex.route_id = r.route_id AND ex.travel_date = s.travel_date
        )`
      );
    }

    // 8. Refresh expired schedules & sync sequences
    await refreshExpiredScheduleDates(db);
    await syncCoreSequences(db);

    console.log("✅ Auto-migration & database initialization complete");
  } catch (err) {
    console.error("⚠️ Auto-migration error:", err.message);
  }
};

module.exports = { autoMigrateDatabase };
