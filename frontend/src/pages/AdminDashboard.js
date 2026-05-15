import { useEffect, useState } from 'react';
import {
  addBus,
  addRoute,
  addSchedule,
  deleteBus,
  deleteSchedule,
  getAdminStats,
  getAllBookings,
  getAllSchedules,
  getBuses,
  getRoutes,
  updateSchedule,
} from '../services/api';

const initialBusForm = {
  bus_number: '',
  bus_type: 'AC Seater',
  capacity: '',
  driver_name: '',
  amenities: '',
};

const initialRouteForm = {
  source: '',
  destination: '',
  distance: '',
  price_per_km: '1.50',
};

const initialScheduleForm = {
  bus_id: '',
  route_id: '',
  travel_date: '',
  departure_time: '',
  arrival_time: '',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddBus, setShowAddBus] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [busForm, setBusForm] = useState(initialBusForm);
  const [routeForm, setRouteForm] = useState(initialRouteForm);
  const [scheduleForm, setScheduleForm] = useState(initialScheduleForm);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([getBuses(), getRoutes(), getAllSchedules(), getAllBookings(), getAdminStats()])
      .then(([busRes, routeRes, scheduleRes, bookingRes, statsRes]) => {
        setBuses(busRes.data);
        setRoutes(routeRes.data);
        setSchedules(scheduleRes.data);
        setBookings(bookingRes.data);
        setStats(statsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toast = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(''), 3000);
  };

  const parseAmenities = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

  const handleAddBus = async () => {
    if (!busForm.bus_number || !busForm.capacity) {
      toast('Fill required bus fields');
      return;
    }

    try {
      const res = await addBus({
        ...busForm,
        capacity: parseInt(busForm.capacity, 10),
        amenities: parseAmenities(busForm.amenities),
      });
      setBuses((prev) => [...prev, res.data]);
      setShowAddBus(false);
      setBusForm(initialBusForm);
      toast('Bus added successfully');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to add bus');
    }
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await deleteBus(id);
      setBuses((prev) => prev.filter((bus) => bus.bus_id !== id));
      setSchedules((prev) => prev.filter((schedule) => schedule.bus_id !== id));
      toast('Bus deleted');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete bus');
    }
  };

  const handleAddRoute = async () => {
    if (!routeForm.source || !routeForm.destination || !routeForm.distance) {
      toast('Fill required route fields');
      return;
    }

    try {
      const res = await addRoute({
        ...routeForm,
        distance: parseInt(routeForm.distance, 10),
        price_per_km: parseFloat(routeForm.price_per_km),
      });
      setRoutes((prev) => [...prev, res.data]);
      setShowAddRoute(false);
      setRouteForm(initialRouteForm);
      toast('Route added');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to add route');
    }
  };

  const handleAddSchedule = async () => {
    const { bus_id, route_id, travel_date, departure_time, arrival_time } = scheduleForm;
    if (!bus_id || !route_id || !travel_date || !departure_time || !arrival_time) {
      toast('Fill required schedule fields');
      return;
    }

    try {
      const res = await addSchedule({
        bus_id: parseInt(bus_id, 10),
        route_id: parseInt(route_id, 10),
        travel_date,
        departure_time,
        arrival_time,
      });
      setSchedules((prev) => [...prev, res.data]);
      setShowAddSchedule(false);
      setScheduleForm(initialScheduleForm);
      toast('Schedule added');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to add schedule');
    }
  };

  const handleScheduleStatusChange = async (schedule, nextStatus) => {
    try {
      const res = await updateSchedule(schedule.schedule_id, {
        bus_id: schedule.bus_id,
        route_id: schedule.route_id,
        travel_date: schedule.travel_date,
        departure_time: schedule.departure_time,
        arrival_time: schedule.arrival_time,
        status: nextStatus,
      });
      setSchedules((prev) => prev.map((item) => (item.schedule_id === schedule.schedule_id ? res.data : item)));
      toast('Schedule updated');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((schedule) => schedule.schedule_id !== id));
      toast('Schedule deleted');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete schedule');
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="page">
      {msg && <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#10b981', color: 'white', padding: '1rem 1.5rem', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 9999, fontSize: '0.9rem' }}>{msg}</div>}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Manage buses, routes, schedules and bookings</p>
        </div>
        <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>Admin Mode</span>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: stats.totalUsers || 0, color: '#1a56db', bg: 'rgba(26,86,219,0.1)' },
          { label: 'Total Buses', value: buses.length, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
          { label: 'Total Schedules', value: schedules.length, color: '#0f766e', bg: 'rgba(15,118,110,0.1)' },
          { label: 'Revenue', value: `Rs ${Math.round(stats.totalRevenue || 0)}`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div style={{ width: 52, height: 52, borderRadius: 14, background: stat.bg, marginBottom: '1rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, letterSpacing: -1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {[['overview', 'Overview'], ['buses', 'Buses'], ['routes', 'Routes'], ['schedules', 'Schedules'], ['bookings', 'Bookings']].map(([value, label]) => (
          <button key={value} className={`tab ${tab === value ? 'active' : ''}`} onClick={() => setTab(value)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Upcoming Schedules</h3>
            {schedules.slice(0, 5).map((schedule) => (
              <div key={schedule.schedule_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f1f5f9', borderRadius: 10, marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{schedule.source} to {schedule.destination}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{schedule.bus_number} - {new Date(schedule.travel_date).toLocaleDateString('en-IN')}</div>
                </div>
                <span className={`badge ${schedule.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{schedule.status}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Bookings</h3>
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.booking_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f1f5f9', borderRadius: 10, marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{booking.passenger_name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{booking.source} to {booking.destination}</div>
                </div>
                <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : booking.status === 'cancelled' ? 'badge-error' : 'badge-warning'}`}>{booking.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'buses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>Fleet ({buses.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddBus(true)}>Add Bus</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Bus Number</th><th>Type</th><th>Capacity</th><th>Driver</th><th>Amenities</th><th>Actions</th></tr></thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.bus_id}>
                    <td style={{ fontWeight: 700 }}>{bus.bus_number}</td>
                    <td><span className="badge badge-info">{bus.bus_type}</span></td>
                    <td>{bus.capacity}</td>
                    <td>{bus.driver_name || '-'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{(bus.amenities || []).join(', ') || '-'}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteBus(bus.bus_id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'routes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>Routes ({routes.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddRoute(true)}>Add Route</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>ID</th><th>From</th><th>To</th><th>Distance</th><th>Price/km</th><th>Base Fare</th></tr></thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.route_id}>
                    <td style={{ fontWeight: 700 }}>#{route.route_id}</td>
                    <td>{route.source}</td>
                    <td>{route.destination}</td>
                    <td>{route.distance} km</td>
                    <td>Rs {route.price_per_km}</td>
                    <td style={{ fontWeight: 700, color: '#1a56db' }}>Rs {Math.round(route.distance * route.price_per_km)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'schedules' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>Schedules ({schedules.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddSchedule(true)}>Add Schedule</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Route</th><th>Bus</th><th>Date</th><th>Time</th><th>Seats</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.schedule_id}>
                    <td style={{ fontWeight: 700 }}>#{schedule.schedule_id}</td>
                    <td>{schedule.source} to {schedule.destination}</td>
                    <td>{schedule.bus_number}</td>
                    <td>{new Date(schedule.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{schedule.departure_time} - {schedule.arrival_time}</td>
                    <td>{schedule.available_seats}/{schedule.capacity}</td>
                    <td>
                      <select className="form-control" value={schedule.status} onChange={(e) => handleScheduleStatusChange(schedule, e.target.value)}>
                        {['active', 'inactive', 'completed'].map((statusOption) => <option key={statusOption}>{statusOption}</option>)}
                      </select>
                    </td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteSchedule(schedule.schedule_id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>All Bookings ({bookings.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Passenger</th><th>Route</th><th>Date</th><th>Seats</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td style={{ fontWeight: 700 }}>#{booking.booking_id}</td>
                    <td>{booking.passenger_name}</td>
                    <td>{booking.source} to {booking.destination}</td>
                    <td>{booking.travel_date ? new Date(booking.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</td>
                    <td>{booking.seats_booked}</td>
                    <td style={{ fontWeight: 700 }}>Rs {booking.total_amount}</td>
                    <td><span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : booking.status === 'cancelled' ? 'badge-error' : 'badge-warning'}`}>{booking.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddBus && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3 className="modal-title">Add New Bus</h3><button className="modal-close" onClick={() => setShowAddBus(false)}>x</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label>Bus Number *</label><input className="form-control" placeholder="MH-12-XX-0000" value={busForm.bus_number} onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value })} /></div>
              <div className="form-group">
                <label>Bus Type *</label>
                <select className="form-control" value={busForm.bus_type} onChange={(e) => setBusForm({ ...busForm, bus_type: e.target.value })}>
                  {['AC Sleeper', 'Non-AC Seater', 'AC Seater', 'Luxury Volvo'].map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div className="input-row">
                <div className="form-group"><label>Capacity *</label><input className="form-control" type="number" placeholder="40" value={busForm.capacity} onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })} /></div>
                <div className="form-group"><label>Driver Name</label><input className="form-control" placeholder="Driver name" value={busForm.driver_name} onChange={(e) => setBusForm({ ...busForm, driver_name: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Amenities</label><input className="form-control" placeholder="AC, WiFi, Charging Point" value={busForm.amenities} onChange={(e) => setBusForm({ ...busForm, amenities: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setShowAddBus(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddBus}>Add Bus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddRoute && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3 className="modal-title">Add New Route</h3><button className="modal-close" onClick={() => setShowAddRoute(false)}>x</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-row">
                <div className="form-group"><label>From *</label><input className="form-control" placeholder="Mumbai" value={routeForm.source} onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })} /></div>
                <div className="form-group"><label>To *</label><input className="form-control" placeholder="Pune" value={routeForm.destination} onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })} /></div>
              </div>
              <div className="input-row">
                <div className="form-group"><label>Distance (km) *</label><input className="form-control" type="number" placeholder="150" value={routeForm.distance} onChange={(e) => setRouteForm({ ...routeForm, distance: e.target.value })} /></div>
                <div className="form-group"><label>Price/km (Rs)</label><input className="form-control" type="number" step="0.1" placeholder="1.50" value={routeForm.price_per_km} onChange={(e) => setRouteForm({ ...routeForm, price_per_km: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setShowAddRoute(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddRoute}>Add Route</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddSchedule && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3 className="modal-title">Add New Schedule</h3><button className="modal-close" onClick={() => setShowAddSchedule(false)}>x</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-row">
                <div className="form-group">
                  <label>Bus *</label>
                  <select className="form-control" value={scheduleForm.bus_id} onChange={(e) => setScheduleForm({ ...scheduleForm, bus_id: e.target.value })}>
                    <option value="">Select Bus</option>
                    {buses.map((bus) => <option key={bus.bus_id} value={bus.bus_id}>{bus.bus_number} ({bus.bus_type})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Route *</label>
                  <select className="form-control" value={scheduleForm.route_id} onChange={(e) => setScheduleForm({ ...scheduleForm, route_id: e.target.value })}>
                    <option value="">Select Route</option>
                    {routes.map((route) => <option key={route.route_id} value={route.route_id}>{route.source} to {route.destination}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-row">
                <div className="form-group"><label>Date *</label><input className="form-control" type="date" value={scheduleForm.travel_date} onChange={(e) => setScheduleForm({ ...scheduleForm, travel_date: e.target.value })} /></div>
                <div className="form-group"><label>Departure *</label><input className="form-control" type="time" value={scheduleForm.departure_time} onChange={(e) => setScheduleForm({ ...scheduleForm, departure_time: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Arrival *</label><input className="form-control" type="time" value={scheduleForm.arrival_time} onChange={(e) => setScheduleForm({ ...scheduleForm, arrival_time: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setShowAddSchedule(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddSchedule}>Add Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
