import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Ticket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data.filter((b) => b.status === 'confirmed')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const printTicket = (b) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>BusMS Ticket #${b.booking_id}</title>
    <style>body{font-family:sans-serif;padding:20px;max-width:500px;margin:auto;}
    .header{background:#1a56db;color:white;padding:20px;border-radius:8px 8px 0 0;}
    .body{border:1px solid #e2e8f0;border-radius:0 0 8px 8px;padding:20px;}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e2e8f0;}
    .label{color:#64748b;font-size:12px;text-transform:uppercase;}
    .value{font-weight:700;}</style></head><body>
    <div class="header"><h2 style="margin:0">BusMS Ticket</h2><p style="margin:5px 0 0;opacity:0.8">Booking #${b.booking_id}</p></div>
    <div class="body">
    ${[['Passenger', user?.name], ['Route', `${b.source} to ${b.destination}`], ['Date', new Date(b.travel_date).toLocaleDateString()], ['Departure', b.departure_time], ['Bus', `${b.bus_number} (${b.bus_type})`], ['Driver', b.driver_name], ['Seats', b.tickets?.map((t) => t.seat_number).join(', ') || b.seats_booked], ['Amount', `Rs ${b.total_amount}`], ['Status', 'CONFIRMED']].map(([l, v]) => `<div class="row"><span class="label">${l}</span><span class="value">${v}</span></div>`).join('')}
    </div><script>window.print();<\/script></body></html>`);
    w.document.close();
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Tickets</h1>
        <p className="page-sub">All your confirmed travel tickets</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">Ticket</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No tickets yet</h3>
          <p>Book a bus to get your first ticket.</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/search')}>Search Buses</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 520, margin: '0 auto' }}>
          {bookings.map((b) => (
            <div key={b.booking_id} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', border: '2px solid #e2e8f0' }}>
              <div style={{ background: 'linear-gradient(135deg,#1a56db,#3b82f6)', color: 'white', padding: '1.5rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.2rem' }}>TICKET ID</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: 1 }}>#{b.booking_id}</div>
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 700 }}>CONFIRMED</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{b.source} to {b.destination}</div>
              </div>

              <div style={{ padding: '1.5rem 2rem' }}>
                {[['Passenger', user?.name], ['Bus', `${b.bus_number} (${b.bus_type})`], ['Date', new Date(b.travel_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })], ['Departure', b.departure_time], ['Arrival', b.arrival_time], ['Seats', b.tickets?.map((t) => t.seat_number).join(', ') || `${b.seats_booked} seat(s)`], ['Amount', `Rs ${b.total_amount}`]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{l}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => printTicket(b)}>Print Ticket</button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowQR(showQR === b.booking_id ? null : b.booking_id)}>
                  {showQR === b.booking_id ? 'Hide QR' : 'Show QR'}
                </button>
              </div>

              {showQR === b.booking_id && (
                <div style={{ padding: '1rem 2rem 1.5rem', textAlign: 'center', borderTop: '1px dashed #e2e8f0' }}>
                  <div style={{ width: 120, height: 120, margin: '0 auto', background: '#0f172a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'white', fontWeight: 700 }}>QR</div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Scan at bus terminal. Valid for one journey.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
