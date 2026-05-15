\c bus_management;

-- Password for all sample users: pass123
-- bcrypt hash generated for "pass123"
-- $2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2

-- ============================================================
--  Users
-- ============================================================
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin User',      'admin@busms.com',            '9000000000', '$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2', 'admin'),
('John Traveler',   'john@example.com',           '9876543210', '$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2', 'passenger'),
('Jane Smith',      'jane@example.com',           '9876543211', '$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2', 'passenger'),
('Aarav Sharma',    'aarav.sharma@email.com',     '9876543212', '$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2', 'passenger'),
('Priya Mehta',     'priya.mehta@email.com',      '9876543213', '$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2', 'passenger')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
--  Bus
-- ============================================================
INSERT INTO bus (bus_number, bus_type, capacity, driver_name) VALUES
('MH-12-AB-1234', 'AC Sleeper',    40, 'Radhika Verma'),
('MH-12-CD-5678', 'Non-AC Seater', 50, 'Shraiyansh Chaware'),
('MH-12-EF-9012', 'AC Seater',     45, 'Abhishek Yadav'),
('MH-12-GH-3456', 'Luxury Volvo',  35, 'Nandini Kanaujiya'),
('KA-01-TR-7788', 'AC Sleeper',    42, 'Mahesh Kumar'),
('DL-05-BS-2201', 'Luxury Volvo',  36, 'Simran Kaur'),
('TN-09-CH-8899', 'AC Seater',     44, 'Karthik Raman'),
('TS-11-HY-4412', 'Non-AC Seater', 48, 'Sandeep Reddy'),
('UP-70-PA-4501', 'AC Sleeper',    40, 'Vikram Singh'),
('GJ-01-AH-7721', 'Luxury Volvo',  36, 'Manoj Patel'),
('UP-78-TR-6632', 'AC Seater',     44, 'Rohit Tiwari')
ON CONFLICT (bus_number) DO NOTHING;

-- ============================================================
--  Bus Amenity
-- ============================================================
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

INSERT INTO bus_amenity (bus_id, amenity)
SELECT b.bus_id, amenity_list.amenity
FROM bus b
CROSS JOIN (
  VALUES
    ('AC'),
    ('WiFi'),
    ('Charging Point'),
    ('Blanket')
) AS amenity_list(amenity)
WHERE b.bus_number = 'UP-70-PA-4501'
ON CONFLICT (bus_id, amenity) DO NOTHING;

INSERT INTO bus_amenity (bus_id, amenity)
SELECT b.bus_id, amenity_list.amenity
FROM bus b
CROSS JOIN (
  VALUES
    ('AC'),
    ('WiFi'),
    ('Entertainment'),
    ('Snacks')
) AS amenity_list(amenity)
WHERE b.bus_number = 'GJ-01-AH-7721'
ON CONFLICT (bus_id, amenity) DO NOTHING;

INSERT INTO bus_amenity (bus_id, amenity)
SELECT b.bus_id, amenity_list.amenity
FROM bus b
CROSS JOIN (
  VALUES
    ('AC'),
    ('Charging Point'),
    ('Cushion Seats')
) AS amenity_list(amenity)
WHERE b.bus_number = 'UP-78-TR-6632'
ON CONFLICT (bus_id, amenity) DO NOTHING;

-- ============================================================
--  Route
-- ============================================================
INSERT INTO route (source, destination, distance, price_per_km) VALUES
('Mumbai',    'Pune',      150, 2.00),
('Mumbai',    'Nashik',    167, 1.80),
('Pune',      'Bangalore', 838, 1.50),
('Mumbai',    'Goa',       590, 1.90),
('Delhi',     'Agra',      206, 1.70),
('Delhi',     'Jaipur',    281, 1.60),
('Chennai',   'Bangalore', 346, 1.75),
('Hyderabad', 'Mumbai',    711, 1.85),
('Pune',      'Mumbai',    150, 2.00),
('Nashik',    'Mumbai',    167, 1.80),
('Goa',       'Mumbai',    590, 1.90),
('Bangalore', 'Pune',      838, 1.50),
('Agra',      'Delhi',     206, 1.70),
('Jaipur',    'Delhi',     281, 1.60),
('Bangalore', 'Chennai',   346, 1.75),
('Mumbai',    'Hyderabad', 711, 1.85),
('Pune',      'Goa',       440, 1.95),
('Goa',       'Pune',      440, 1.95),
('Delhi',     'Mumbai',   1410, 1.65),
('Mumbai',    'Delhi',    1410, 1.65),
('Hyderabad', 'Bangalore', 570, 1.80),
('Bangalore', 'Hyderabad', 570, 1.80),
('Prayagraj', 'Ahmedabad', 1290, 1.70),
('Ahmedabad', 'Prayagraj', 1290, 1.70)
ON CONFLICT (source, destination) DO NOTHING;

-- ============================================================
--  Schedule
-- ============================================================
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

INSERT INTO schedule (bus_id, route_id, travel_date, departure_time, arrival_time, available_seats, status)
SELECT b.bus_id, r.route_id, CURRENT_DATE + 2, '18:30'::time, '17:00'::time, b.capacity, 'active'
FROM bus b
JOIN route r
  ON r.source = 'Prayagraj'
 AND r.destination = 'Ahmedabad'
WHERE b.bus_number = 'UP-70-PA-4501'
  AND NOT EXISTS (
    SELECT 1
    FROM schedule existing
    WHERE existing.bus_id = b.bus_id
      AND existing.route_id = r.route_id
      AND existing.travel_date = CURRENT_DATE + 2
      AND existing.departure_time = '18:30'::time
  );

INSERT INTO schedule (bus_id, route_id, travel_date, departure_time, arrival_time, available_seats, status)
SELECT b.bus_id, r.route_id, s.travel_date, s.departure_time, s.arrival_time, b.capacity, 'active'
FROM (
  VALUES
    ('GJ-01-AH-7721', 'Prayagraj', 'Ahmedabad', CURRENT_DATE + 3, '20:00'::time, '18:15'::time),
    ('UP-78-TR-6632', 'Prayagraj', 'Ahmedabad', CURRENT_DATE + 4, '07:15'::time, '05:45'::time),
    ('UP-70-PA-4501', 'Ahmedabad', 'Prayagraj', CURRENT_DATE + 3, '19:00'::time, '17:30'::time),
    ('GJ-01-AH-7721', 'Ahmedabad', 'Prayagraj', CURRENT_DATE + 5, '06:45'::time, '05:00'::time),
    ('UP-78-TR-6632', 'Ahmedabad', 'Prayagraj', CURRENT_DATE + 6, '21:00'::time, '19:20'::time)
) AS s(bus_number, source, destination, travel_date, departure_time, arrival_time)
JOIN bus b
  ON b.bus_number = s.bus_number
JOIN route r
  ON r.source = s.source
 AND r.destination = s.destination
WHERE NOT EXISTS (
  SELECT 1
  FROM schedule existing
  WHERE existing.bus_id = b.bus_id
    AND existing.route_id = r.route_id
    AND existing.travel_date = s.travel_date
    AND existing.departure_time = s.departure_time
);

-- ============================================================
--  Booking
-- ============================================================
INSERT INTO booking (passenger_id, schedule_id, seats_booked, total_amount, status) VALUES
(2, 1, 2, 600.00,  'confirmed'),
(3, 2, 1, 300.00,  'confirmed'),
(4, 3, 3, 901.80,  'confirmed'),
(5, 4, 2, 2514.00, 'pending'),
(2, 4, 1, 1257.00, 'cancelled')
ON CONFLICT DO NOTHING;

-- ============================================================
--  Ticket
-- ============================================================
INSERT INTO ticket (booking_id, seat_number, ticket_status) VALUES
(1, 12, 'active'),
(1, 13, 'active'),
(2, 5,  'active'),
(3, 22, 'active'),
(3, 23, 'active'),
(3, 24, 'active'),
(4, 8,  'active'),
(4, 9,  'active'),
(5, 4,  'cancelled')
ON CONFLICT DO NOTHING;

-- ============================================================
--  Payment
-- ============================================================
INSERT INTO payment (booking_id, amount, payment_method, payment_status, transaction_id) VALUES
(1, 600.00,  'upi',         'success',  'TXN20260328001'),
(2, 300.00,  'credit_card', 'success',  'TXN20260328002'),
(3, 901.80,  'net_banking', 'success',  'TXN20260328003'),
(4, 2514.00, 'debit_card',  'pending',  NULL),
(5, 1257.00, 'upi',         'refunded', 'TXN20260328004')
ON CONFLICT DO NOTHING;

-- ============================================================
--  Alerts
-- ============================================================
INSERT INTO alerts (passenger_id, message, status) VALUES
(2, 'Your booking #1 is confirmed. Departure at 06:00 tomorrow.', 'read'),
(3, 'Your booking #2 is confirmed. Departure at 08:00 tomorrow.', 'read'),
(4, 'Your booking #3 is confirmed.', 'unread'),
(5, 'Your payment for booking #4 is still pending. Please complete payment.', 'unread'),
(2, 'Your booking #5 has been cancelled. Refund is being processed.', 'unread')
ON CONFLICT DO NOTHING;

SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 0) + 1, false);
SELECT setval('bus_bus_id_seq', COALESCE((SELECT MAX(bus_id) FROM bus), 0) + 1, false);
SELECT setval('route_route_id_seq', COALESCE((SELECT MAX(route_id) FROM route), 0) + 1, false);
SELECT setval('schedule_schedule_id_seq', COALESCE((SELECT MAX(schedule_id) FROM schedule), 0) + 1, false);
SELECT setval('booking_booking_id_seq', COALESCE((SELECT MAX(booking_id) FROM booking), 0) + 1, false);
SELECT setval('ticket_ticket_id_seq', COALESCE((SELECT MAX(ticket_id) FROM ticket), 0) + 1, false);
SELECT setval('payment_payment_id_seq', COALESCE((SELECT MAX(payment_id) FROM payment), 0) + 1, false);
SELECT setval('alerts_alert_id_seq', COALESCE((SELECT MAX(alert_id) FROM alerts), 0) + 1, false);
