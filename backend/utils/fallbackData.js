// High-fidelity fallback dataset for zero-downtime resilience
// Serves live demo data seamlessly if the hosted PostgreSQL database is asleep or suspended

const FALLBACK_ROUTES = [
  { route_id: 1, source: "Mumbai", destination: "Pune", distance: 150, price_per_km: 2.0 },
  { route_id: 2, source: "Mumbai", destination: "Nashik", distance: 167, price_per_km: 1.8 },
  { route_id: 3, source: "Pune", destination: "Bangalore", distance: 838, price_per_km: 1.5 },
  { route_id: 4, source: "Mumbai", destination: "Goa", distance: 590, price_per_km: 1.9 },
  { route_id: 5, source: "Delhi", destination: "Agra", distance: 206, price_per_km: 1.7 },
  { route_id: 6, source: "Delhi", destination: "Jaipur", distance: 281, price_per_km: 1.6 },
  { route_id: 7, source: "Chennai", destination: "Bangalore", distance: 346, price_per_km: 1.75 },
  { route_id: 8, source: "Hyderabad", destination: "Mumbai", distance: 711, price_per_km: 1.85 },
  { route_id: 9, source: "Pune", destination: "Mumbai", distance: 150, price_per_km: 2.0 },
  { route_id: 10, source: "Nashik", destination: "Mumbai", distance: 167, price_per_km: 1.8 },
  { route_id: 11, source: "Goa", destination: "Mumbai", distance: 590, price_per_km: 1.9 },
  { route_id: 12, source: "Bangalore", destination: "Pune", distance: 838, price_per_km: 1.5 },
  { route_id: 13, source: "Agra", destination: "Delhi", distance: 206, price_per_km: 1.7 },
  { route_id: 14, source: "Jaipur", destination: "Delhi", distance: 281, price_per_km: 1.6 },
  { route_id: 15, source: "Bangalore", destination: "Chennai", distance: 346, price_per_km: 1.75 },
  { route_id: 16, source: "Mumbai", destination: "Hyderabad", distance: 711, price_per_km: 1.85 },
  { route_id: 17, source: "Pune", destination: "Goa", distance: 440, price_per_km: 1.95 },
  { route_id: 18, source: "Goa", destination: "Pune", distance: 440, price_per_km: 1.95 },
  { route_id: 19, source: "Delhi", destination: "Mumbai", distance: 1410, price_per_km: 1.65 },
  { route_id: 20, source: "Mumbai", destination: "Delhi", distance: 1410, price_per_km: 1.65 },
  { route_id: 21, source: "Hyderabad", destination: "Bangalore", distance: 570, price_per_km: 1.8 },
  { route_id: 22, source: "Bangalore", destination: "Hyderabad", distance: 570, price_per_km: 1.8 },
];

const FALLBACK_BUSES = [
  { bus_id: 1, bus_number: "MH-12-AB-1234", bus_type: "AC Sleeper", capacity: 40, driver_name: "Radhika Verma", amenities: ["AC", "WiFi", "Charging Point", "Blanket"] },
  { bus_id: 2, bus_number: "MH-12-CD-5678", bus_type: "Non-AC Seater", capacity: 50, driver_name: "Shraiyansh Chaware", amenities: ["Fan", "Cushion Seats"] },
  { bus_id: 3, bus_number: "MH-12-EF-9012", bus_type: "AC Seater", capacity: 45, driver_name: "Abhishek Yadav", amenities: ["AC", "Charging Point"] },
  { bus_id: 4, bus_number: "MH-12-GH-3456", bus_type: "Luxury Volvo", capacity: 35, driver_name: "Nandini Kanaujiya", amenities: ["AC", "WiFi", "Entertainment", "Snacks"] },
  { bus_id: 5, bus_number: "KA-01-TR-7788", bus_type: "AC Sleeper", capacity: 42, driver_name: "Mahesh Kumar", amenities: ["AC", "WiFi", "Charging Point"] },
  { bus_id: 6, bus_number: "DL-05-BS-2201", bus_type: "Luxury Volvo", capacity: 36, driver_name: "Simran Kaur", amenities: ["AC", "Blanket", "Snacks"] },
  { bus_id: 7, bus_number: "TN-09-CH-8899", bus_type: "AC Seater", capacity: 44, driver_name: "Karthik Raman", amenities: ["AC", "Charging Point"] },
  { bus_id: 8, bus_number: "TS-11-HY-4412", bus_type: "Non-AC Seater", capacity: 48, driver_name: "Sandeep Reddy", amenities: ["Fan", "Charging Point"] },
];

function getDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getFallbackSchedules(source, destination, travelDate) {
  const allSchedules = [
    { schedule_id: 1, bus_id: 1, route_id: 1, departure_time: "06:00:00", arrival_time: "09:30:00", available_seats: 38, daysOffset: 1 },
    { schedule_id: 2, bus_id: 2, route_id: 1, departure_time: "08:00:00", arrival_time: "11:30:00", available_seats: 45, daysOffset: 1 },
    { schedule_id: 3, bus_id: 3, route_id: 2, departure_time: "07:00:00", arrival_time: "10:30:00", available_seats: 40, daysOffset: 1 },
    { schedule_id: 4, bus_id: 4, route_id: 3, departure_time: "20:00:00", arrival_time: "08:00:00", available_seats: 30, daysOffset: 2 },
    { schedule_id: 5, bus_id: 1, route_id: 4, departure_time: "22:00:00", arrival_time: "10:00:00", available_seats: 35, daysOffset: 2 },
    { schedule_id: 6, bus_id: 5, route_id: 5, departure_time: "05:45:00", arrival_time: "09:15:00", available_seats: 40, daysOffset: 1 },
    { schedule_id: 7, bus_id: 6, route_id: 6, departure_time: "07:30:00", arrival_time: "12:45:00", available_seats: 32, daysOffset: 1 },
    { schedule_id: 8, bus_id: 7, route_id: 7, departure_time: "06:30:00", arrival_time: "12:15:00", available_seats: 39, daysOffset: 1 },
    { schedule_id: 9, bus_id: 8, route_id: 8, departure_time: "19:30:00", arrival_time: "08:30:00", available_seats: 44, daysOffset: 2 },
    { schedule_id: 10, bus_id: 5, route_id: 9, departure_time: "06:15:00", arrival_time: "09:45:00", available_seats: 37, daysOffset: 2 },
    { schedule_id: 11, bus_id: 6, route_id: 10, departure_time: "08:10:00", arrival_time: "11:30:00", available_seats: 30, daysOffset: 2 },
    { schedule_id: 12, bus_id: 7, route_id: 11, departure_time: "18:00:00", arrival_time: "06:30:00", available_seats: 34, daysOffset: 3 },
    { schedule_id: 13, bus_id: 8, route_id: 12, departure_time: "19:45:00", arrival_time: "08:15:00", available_seats: 41, daysOffset: 3 },
    { schedule_id: 14, bus_id: 2, route_id: 13, departure_time: "06:00:00", arrival_time: "09:25:00", available_seats: 43, daysOffset: 2 },
    { schedule_id: 15, bus_id: 3, route_id: 14, departure_time: "16:00:00", arrival_time: "21:15:00", available_seats: 39, daysOffset: 2 },
    { schedule_id: 16, bus_id: 4, route_id: 15, departure_time: "14:00:00", arrival_time: "19:45:00", available_seats: 28, daysOffset: 2 },
    { schedule_id: 17, bus_id: 1, route_id: 16, departure_time: "20:30:00", arrival_time: "09:00:00", available_seats: 35, daysOffset: 3 },
    { schedule_id: 18, bus_id: 5, route_id: 17, departure_time: "23:00:00", arrival_time: "08:30:00", available_seats: 40, daysOffset: 3 },
    { schedule_id: 19, bus_id: 6, route_id: 18, departure_time: "21:30:00", arrival_time: "07:00:00", available_seats: 31, daysOffset: 4 },
    { schedule_id: 20, bus_id: 7, route_id: 19, departure_time: "18:30:00", arrival_time: "18:00:00", available_seats: 42, daysOffset: 4 },
    { schedule_id: 21, bus_id: 8, route_id: 20, departure_time: "17:45:00", arrival_time: "17:15:00", available_seats: 43, daysOffset: 5 },
    { schedule_id: 22, bus_id: 3, route_id: 21, departure_time: "07:00:00", arrival_time: "16:00:00", available_seats: 38, daysOffset: 3 },
    { schedule_id: 23, bus_id: 4, route_id: 22, departure_time: "06:45:00", arrival_time: "15:30:00", available_seats: 29, daysOffset: 4 },
  ];

  const enriched = allSchedules.map((s) => {
    const route = FALLBACK_ROUTES.find((r) => r.route_id === s.route_id) || FALLBACK_ROUTES[0];
    const bus = FALLBACK_BUSES.find((b) => b.bus_id === s.bus_id) || FALLBACK_BUSES[0];
    const computedDate = getDateOffset(s.daysOffset);

    return {
      schedule_id: s.schedule_id,
      bus_id: s.bus_id,
      route_id: s.route_id,
      travel_date: computedDate,
      departure_time: s.departure_time,
      arrival_time: s.arrival_time,
      available_seats: s.available_seats,
      status: "active",
      bus_number: bus.bus_number,
      bus_type: bus.bus_type,
      capacity: bus.capacity,
      driver_name: bus.driver_name,
      amenities: bus.amenities,
      source: route.source,
      destination: route.destination,
      distance: route.distance,
      price_per_km: route.price_per_km,
      base_price: Number((route.distance * route.price_per_km).toFixed(2)),
      booked_seats: [3, 7, 12],
    };
  });

  // Filter based on query params if supplied
  let filtered = enriched;

  if (source && source.trim()) {
    filtered = filtered.filter((s) => s.source.toLowerCase() === source.trim().toLowerCase());
  }

  if (destination && destination.trim()) {
    filtered = filtered.filter((s) => s.destination.toLowerCase() === destination.trim().toLowerCase());
  }

  // If travel_date matches, return exact; otherwise return available buses on route
  if (travelDate && filtered.some((s) => s.travel_date === travelDate)) {
    filtered = filtered.filter((s) => s.travel_date === travelDate);
  }

  // If filters resulted in 0 matches and filters were provided, fallback to matching source or destination
  if (filtered.length === 0 && (source || destination)) {
    filtered = enriched.filter(
      (s) =>
        (source && s.source.toLowerCase().includes(source.trim().toLowerCase())) ||
        (destination && s.destination.toLowerCase().includes(destination.trim().toLowerCase()))
    );
  }

  return filtered.length > 0 ? filtered : enriched;
}

function getFallbackScheduleById(id) {
  const all = getFallbackSchedules();
  return all.find((s) => String(s.schedule_id) === String(id)) || null;
}

function getFallbackBusById(id) {
  return FALLBACK_BUSES.find((b) => String(b.bus_id) === String(id)) || null;
}

// In-memory persistent arrays for session bookings and payments
const inMemoryBookings = [
  {
    booking_id: 101,
    passenger_id: 2,
    schedule_id: 1,
    seats_booked: 2,
    total_amount: 600,
    booking_date: new Date().toISOString(),
    status: "confirmed",
    travel_date: getDateOffset(1),
    departure_time: "06:00:00",
    arrival_time: "09:30:00",
    bus_number: "MH-12-AB-1234",
    bus_type: "AC Sleeper",
    driver_name: "Radhika Verma",
    source: "Mumbai",
    destination: "Pune",
    distance: 150,
    payment_status: "success",
    payment_method: "UPI",
    transaction_id: "TXN_INIT_DEMO_01",
    tickets: [
      { ticket_id: 201, seat_number: 14, ticket_status: "confirmed" },
      { ticket_id: 202, seat_number: 15, ticket_status: "confirmed" },
    ],
  },
];

const inMemoryPayments = [
  {
    payment_id: 1,
    booking_id: 101,
    amount: 600,
    payment_method: "UPI",
    payment_status: "success",
    transaction_id: "TXN_INIT_DEMO_01",
    payment_date: new Date().toISOString(),
  },
];

const inMemoryAlerts = [
  {
    alert_id: 1,
    passenger_id: 2,
    title: "Welcome to BusMS",
    message: "Welcome to BusMS! Search and book luxury & express buses across India seamlessly.",
    type: "info",
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

function createFallbackBooking(passengerId, scheduleId, seatsBooked, seatNumbers) {
  const schedule = getFallbackScheduleById(scheduleId) || getFallbackSchedules()[0];
  const requested = Array.isArray(seatNumbers) && seatNumbers.length === seatsBooked
    ? seatNumbers
    : [4, 5, 6].slice(0, seatsBooked);

  const total = Number((schedule.base_price * seatsBooked).toFixed(2));
  const newBookingId = 100 + inMemoryBookings.length + 1;

  const tickets = requested.map((seat, idx) => ({
    ticket_id: newBookingId * 10 + idx + 1,
    booking_id: newBookingId,
    seat_number: seat,
    ticket_status: "confirmed",
  }));

  const booking = {
    booking_id: newBookingId,
    passenger_id: passengerId,
    schedule_id: schedule.schedule_id,
    seats_booked: seatsBooked,
    total_amount: total,
    booking_date: new Date().toISOString(),
    status: "confirmed",
    travel_date: schedule.travel_date,
    departure_time: schedule.departure_time,
    arrival_time: schedule.arrival_time,
    bus_number: schedule.bus_number,
    bus_type: schedule.bus_type,
    driver_name: schedule.driver_name,
    source: schedule.source,
    destination: schedule.destination,
    distance: schedule.distance,
    payment_status: "pending",
    payment_method: null,
    transaction_id: null,
    tickets,
  };

  inMemoryBookings.unshift(booking);

  inMemoryAlerts.unshift({
    alert_id: inMemoryAlerts.length + 1,
    passenger_id: passengerId,
    title: "Booking Created",
    message: `Booking #${newBookingId} created for ${schedule.source} -> ${schedule.destination}. Proceed to payment.`,
    type: "success",
    is_read: false,
    created_at: new Date().toISOString(),
  });

  return { booking, tickets };
}

function getFallbackBookingsForUser(userId) {
  return inMemoryBookings.filter((b) => !userId || String(b.passenger_id) === String(userId));
}

function getAllFallbackBookings() {
  return inMemoryBookings;
}

function processFallbackPayment(bookingId, paymentMethod) {
  const booking = inMemoryBookings.find((b) => String(b.booking_id) === String(bookingId));
  const txnId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const payment = {
    payment_id: inMemoryPayments.length + 1,
    booking_id: Number(bookingId),
    amount: booking ? booking.total_amount : 500,
    payment_method: paymentMethod || "UPI",
    payment_status: "success",
    transaction_id: txnId,
    payment_date: new Date().toISOString(),
  };

  inMemoryPayments.unshift(payment);

  if (booking) {
    booking.payment_status = "success";
    booking.payment_method = paymentMethod || "UPI";
    booking.transaction_id = txnId;

    inMemoryAlerts.unshift({
      alert_id: inMemoryAlerts.length + 1,
      passenger_id: booking.passenger_id,
      title: "Payment Successful",
      message: `Payment of Rs. ${booking.total_amount} received for Booking #${booking.booking_id}! Transaction ID: ${txnId}`,
      type: "success",
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  return payment;
}

function getFallbackPaymentHistory(userId) {
  if (!userId) return inMemoryPayments;
  const userBookingIds = new Set(
    inMemoryBookings
      .filter((b) => String(b.passenger_id) === String(userId))
      .map((b) => b.booking_id)
  );
  return inMemoryPayments.filter((p) => userBookingIds.has(p.booking_id));
}

function getFallbackAlerts(userId) {
  return inMemoryAlerts.filter(
    (a) => !userId || String(a.passenger_id) === String(userId) || !a.passenger_id
  );
}

function markFallbackAlertRead(alertId, userId) {
  const alert = inMemoryAlerts.find((a) => String(a.alert_id) === String(alertId));
  if (alert) alert.is_read = true;
  return { success: true };
}

function markAllFallbackAlertsRead(userId) {
  inMemoryAlerts.forEach((a) => {
    if (!userId || String(a.passenger_id) === String(userId)) {
      a.is_read = true;
    }
  });
  return { success: true };
}

function getFallbackAdminStats() {
  return {
    totalUsers: 48 + inMemoryUsers.length - 3,
    totalBuses: FALLBACK_BUSES.length,
    totalBookings: inMemoryBookings.length + 15,
    totalRevenue: inMemoryBookings.reduce((sum, b) => sum + (b.total_amount || 0), 18450),
  };
}

const FALLBACK_PASSWORD_HASH = "$2a$10$KFiVXHDt2HRf8YP101jStu4kfT9obPNKVyspD7JF6JKx3QNt3H6O2"; // pass123

const inMemoryUsers = [
  {
    user_id: 1,
    name: "Admin User",
    email: "admin@busms.com",
    role: "admin",
    phone: "9999999999",
    password: FALLBACK_PASSWORD_HASH,
    password_hash: FALLBACK_PASSWORD_HASH,
  },
  {
    user_id: 2,
    name: "John Traveler",
    email: "john@example.com",
    role: "passenger",
    phone: "9876543210",
    password: FALLBACK_PASSWORD_HASH,
    password_hash: FALLBACK_PASSWORD_HASH,
  },
  {
    user_id: 3,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "passenger",
    phone: "9876543211",
    password: FALLBACK_PASSWORD_HASH,
    password_hash: FALLBACK_PASSWORD_HASH,
  },
];

function registerFallbackUser(name, email, phone, hashedPassword, forcedId, role = "passenger") {
  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    existing.name = name || existing.name;
    existing.phone = phone || existing.phone;
    if (hashedPassword) {
      existing.password = hashedPassword;
      existing.password_hash = hashedPassword;
    }
    return existing;
  }

  const newUserId = forcedId || (100 + inMemoryUsers.length + 1);
  const newUser = {
    user_id: newUserId,
    name,
    email: normalizedEmail,
    role,
    phone: phone || null,
    password: hashedPassword,
    password_hash: hashedPassword,
    created_at: new Date().toISOString(),
  };

  inMemoryUsers.push(newUser);
  return newUser;
}

function findFallbackUserByEmail(email) {
  if (!email) return null;
  const normalized = String(email).toLowerCase().trim();
  return inMemoryUsers.find((u) => u.email.toLowerCase() === normalized) || null;
}

module.exports = {
  FALLBACK_ROUTES,
  FALLBACK_BUSES,
  getFallbackSchedules,
  getFallbackScheduleById,
  getFallbackBusById,
  createFallbackBooking,
  getFallbackBookingsForUser,
  getAllFallbackBookings,
  processFallbackPayment,
  getFallbackPaymentHistory,
  getFallbackAlerts,
  markFallbackAlertRead,
  markAllFallbackAlertsRead,
  getFallbackAdminStats,
  registerFallbackUser,
  findFallbackUserByEmail,
};


