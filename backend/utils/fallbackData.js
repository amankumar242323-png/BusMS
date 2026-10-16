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

module.exports = {
  FALLBACK_ROUTES,
  FALLBACK_BUSES,
  getFallbackSchedules,
};
