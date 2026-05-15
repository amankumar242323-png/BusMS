
\c bus_management;

-- Users
CREATE TABLE IF NOT EXISTS users (
    user_id    SERIAL PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(100)  UNIQUE NOT NULL,
    phone      VARCHAR(15),
    password   VARCHAR(255)  NOT NULL,
    role       VARCHAR(20)   DEFAULT 'passenger',
    created_at TIMESTAMP     DEFAULT NOW()
);

-- Bus  (amenities column removed - now in bus_amenity)
CREATE TABLE IF NOT EXISTS bus (
    bus_id      SERIAL PRIMARY KEY,
    bus_number  VARCHAR(50)  UNIQUE NOT NULL,
    bus_type    VARCHAR(50)  NOT NULL,
    capacity    INT          NOT NULL,
    driver_name VARCHAR(100),
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- Bus amenity <- one row per amenity per bus
CREATE TABLE IF NOT EXISTS bus_amenity (
    amenity_id  SERIAL PRIMARY KEY,
    bus_id      INT          NOT NULL REFERENCES bus(bus_id) ON DELETE CASCADE,
    amenity     VARCHAR(100) NOT NULL,
    UNIQUE (bus_id, amenity)
);

-- Route
CREATE TABLE IF NOT EXISTS route (
    route_id     SERIAL PRIMARY KEY,
    source       VARCHAR(100)   NOT NULL,
    destination  VARCHAR(100)   NOT NULL,
    distance     INT            NOT NULL,
    price_per_km DECIMAL(6,2)   DEFAULT 1.50,
    created_at   TIMESTAMP      DEFAULT NOW()
);

-- Schedule
CREATE TABLE IF NOT EXISTS schedule (
    schedule_id      SERIAL PRIMARY KEY,
    bus_id           INT REFERENCES bus(bus_id) ON DELETE CASCADE,
    route_id         INT REFERENCES route(route_id) ON DELETE CASCADE,
    travel_date      DATE         NOT NULL,
    departure_time   TIME         NOT NULL,
    arrival_time     TIME         NOT NULL,
    available_seats  INT,
    status           VARCHAR(30)  DEFAULT 'active',
    created_at       TIMESTAMP    DEFAULT NOW()
);

-- Booking
CREATE TABLE IF NOT EXISTS booking (
    booking_id   SERIAL PRIMARY KEY,
    passenger_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    schedule_id  INT REFERENCES schedule(schedule_id) ON DELETE CASCADE,
    seats_booked INT         NOT NULL,
    booking_date TIMESTAMP   DEFAULT NOW(),
    total_amount DECIMAL(10,2),
    status       VARCHAR(30) DEFAULT 'pending'
);

-- Ticket
CREATE TABLE IF NOT EXISTS ticket (
    ticket_id      SERIAL PRIMARY KEY,
    booking_id     INT REFERENCES booking(booking_id) ON DELETE CASCADE,
    seat_number    INT         NOT NULL,
    ticket_status  VARCHAR(50) DEFAULT 'active',
    created_at     TIMESTAMP   DEFAULT NOW()
);

-- Payment
CREATE TABLE IF NOT EXISTS payment (
    payment_id      SERIAL PRIMARY KEY,
    booking_id      INT REFERENCES booking(booking_id) ON DELETE CASCADE,
    amount          DECIMAL(10,2) NOT NULL,
    payment_method  VARCHAR(50)   NOT NULL,
    payment_status  VARCHAR(50)   DEFAULT 'pending',
    transaction_id  VARCHAR(100),
    payment_date    TIMESTAMP     DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    alert_id     SERIAL PRIMARY KEY,
    passenger_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    message      TEXT         NOT NULL,
    status       VARCHAR(50)  DEFAULT 'unread',
    created_at   TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
--  Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(travel_date);
CREATE INDEX IF NOT EXISTS idx_schedule_route ON schedule(route_id);
CREATE INDEX IF NOT EXISTS idx_booking_passenger ON booking(passenger_id);
CREATE INDEX IF NOT EXISTS idx_alerts_passenger ON alerts(passenger_id);
CREATE INDEX IF NOT EXISTS idx_route_cities ON route(source, destination);
CREATE UNIQUE INDEX IF NOT EXISTS idx_route_unique_pair ON route(source, destination);
CREATE INDEX IF NOT EXISTS idx_bus_amenity_bus ON bus_amenity(bus_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_schedule_unique_trip
ON schedule (bus_id, route_id, travel_date, departure_time);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_one_success_per_booking
ON payment (booking_id)
WHERE payment_status = 'success';
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transaction_id
ON payment (transaction_id)
WHERE transaction_id IS NOT NULL;

-- ============================================================
--  Demo Seed
-- ============================================================
-- Password for all sample users: "pass123"
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Admin User',  'admin@busms.com',   '9999999999',
   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'admin'),
  ('John Traveler','john@example.com', '9876543210',
   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'passenger'),
  ('Jane Smith',  'jane@example.com',  '9876543211',
   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'passenger')
ON CONFLICT (email) DO NOTHING;

INSERT INTO bus (bus_number, bus_type, capacity, driver_name) VALUES
  ('MH-12-AB-1234', 'AC Sleeper',   40, 'Radhika Verma'),
  ('MH-12-CD-5678', 'Non-AC Seater',50, 'Shraiyansh Chaware'),
  ('MH-12-EF-9012', 'AC Seater',    45, 'Abhishek Yadav'),
  ('MH-12-GH-3456', 'Luxury Volvo', 35, 'Nandini Kanaujiya'),
  ('KA-01-TR-7788', 'AC Sleeper',   42, 'Mahesh Kumar'),
  ('DL-05-BS-2201', 'Luxury Volvo', 36, 'Simran Kaur'),
  ('TN-09-CH-8899', 'AC Seater',    44, 'Karthik Raman'),
  ('TS-11-HY-4412', 'Non-AC Seater',48, 'Sandeep Reddy')
ON CONFLICT (bus_number) DO NOTHING;

INSERT INTO bus_amenity (bus_id, amenity) VALUES
  (1, 'AC'),
  (1, 'WiFi'),
  (1, 'Charging Point'),
  (1, 'Blanket'),
  (2, 'Fan'),
  (2, 'Cushion Seats'),
  (3, 'AC'),
  (3, 'Charging Point'),
  (4, 'AC'),
  (4, 'WiFi'),
  (4, 'Entertainment'),
  (4, 'Snacks'),
  (5, 'AC'),
  (5, 'WiFi'),
  (5, 'Charging Point'),
  (6, 'AC'),
  (6, 'Blanket'),
  (6, 'Snacks'),
  (7, 'AC'),
  (7, 'Charging Point'),
  (8, 'Fan'),
  (8, 'Charging Point')
ON CONFLICT (bus_id, amenity) DO NOTHING;

INSERT INTO route (source, destination, distance, price_per_km) VALUES
  ('Mumbai',   'Pune',      150, 2.00),
  ('Mumbai',   'Nashik',    167, 1.80),
  ('Pune',     'Bangalore', 838, 1.50),
  ('Mumbai',   'Goa',       590, 1.90),
  ('Delhi',    'Agra',      206, 1.70),
  ('Delhi',    'Jaipur',    281, 1.60),
  ('Chennai',  'Bangalore', 346, 1.75),
  ('Hyderabad','Mumbai',    711, 1.85),
  ('Pune',     'Mumbai',    150, 2.00),
  ('Nashik',   'Mumbai',    167, 1.80),
  ('Goa',      'Mumbai',    590, 1.90),
  ('Bangalore','Pune',      838, 1.50),
  ('Agra',     'Delhi',     206, 1.70),
  ('Jaipur',   'Delhi',     281, 1.60),
  ('Bangalore','Chennai',   346, 1.75),
  ('Mumbai',   'Hyderabad', 711, 1.85),
  ('Pune',     'Goa',       440, 1.95),
  ('Goa',      'Pune',      440, 1.95),
  ('Delhi',    'Mumbai',   1410, 1.65),
  ('Mumbai',   'Delhi',    1410, 1.65),
  ('Hyderabad','Bangalore', 570, 1.80),
  ('Bangalore','Hyderabad', 570, 1.80);

INSERT INTO schedule (bus_id, route_id, travel_date, departure_time, arrival_time, available_seats, status)
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
  SELECT 1
  FROM schedule existing
  WHERE existing.bus_id = s.bus_id
    AND existing.route_id = r.route_id
    AND existing.travel_date = s.travel_date
    AND existing.departure_time = s.departure_time
);

SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 0) + 1, false);
SELECT setval('bus_bus_id_seq', COALESCE((SELECT MAX(bus_id) FROM bus), 0) + 1, false);
SELECT setval('route_route_id_seq', COALESCE((SELECT MAX(route_id) FROM route), 0) + 1, false);
SELECT setval('schedule_schedule_id_seq', COALESCE((SELECT MAX(schedule_id) FROM schedule), 0) + 1, false);
SELECT setval('booking_booking_id_seq', COALESCE((SELECT MAX(booking_id) FROM booking), 0) + 1, false);
SELECT setval('ticket_ticket_id_seq', COALESCE((SELECT MAX(ticket_id) FROM ticket), 0) + 1, false);
SELECT setval('payment_payment_id_seq', COALESCE((SELECT MAX(payment_id) FROM payment), 0) + 1, false);
SELECT setval('alerts_alert_id_seq', COALESCE((SELECT MAX(alert_id) FROM alerts), 0) + 1, false);
