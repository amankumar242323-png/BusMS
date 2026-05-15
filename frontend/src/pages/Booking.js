import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/api';
import SeatSelector from '../components/SeatSelector';

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const schedule = state?.schedule;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!schedule) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">Seat</div>
          <h3>No bus selected</h3>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/search')}>Search Buses</button>
        </div>
      </div>
    );
  }

  const price = Math.round(schedule.base_price);
  const total = price * selectedSeats.length;
  const booked = Array.isArray(schedule.booked_seats) ? schedule.booked_seats : [];

  const toggleSeat = (n) => {
    setSelectedSeats((p) => (p.includes(n) ? p.filter((s) => s !== n) : p.length < 6 ? [...p, n] : p));
  };

  const handleConfirm = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await createBooking({ schedule_id: schedule.schedule_id, seats_booked: selectedSeats.length, seat_numbers: selectedSeats });
      navigate('/payment', { state: { booking: res.data.booking, schedule } });
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Select Your Seats</h1>
          <p className="page-sub">{schedule.source} to {schedule.destination} | {new Date(schedule.travel_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>Back</button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Seat Map (Max 6 seats)</h3>
          <SeatSelector capacity={Math.min(schedule.capacity, 32)} bookedSeats={booked} selectedSeats={selectedSeats} onSelect={toggleSeat} />
        </div>

        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Journey Details</h3>
            {[['Bus', `${schedule.bus_number} (${schedule.bus_type})`], ['Route', `${schedule.source} to ${schedule.destination}`], ['Date', new Date(schedule.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })], ['Departure', schedule.departure_time], ['Arrival', schedule.arrival_time], ['Driver', schedule.driver_name], ['Available', `${schedule.available_seats} seats`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>{l}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Booking Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span style={{ color: '#64748b' }}>Selected Seats</span><span style={{ fontWeight: 600 }}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span style={{ color: '#64748b' }}>Price per seat</span><span style={{ fontWeight: 600 }}>Rs {price}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span style={{ color: '#64748b' }}>No. of seats</span><span style={{ fontWeight: 600 }}>x {selectedSeats.length}</span></div>
              <div className="divider" style={{ margin: '0.4rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}><span>Total</span><span style={{ color: '#1a56db' }}>Rs {total}</span></div>
            </div>
            <button className="btn btn-accent btn-lg btn-block" onClick={handleConfirm} disabled={loading || selectedSeats.length === 0}>
              {loading ? 'Processing...' : `Proceed to Payment -> Rs ${total}`}
            </button>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' }}>Secure booking powered by BusMS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
