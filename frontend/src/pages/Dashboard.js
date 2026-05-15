import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    getMyBookings().then((res) => setBookings(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.booking_id === id ? { ...b, status: 'cancelled' } : b)));
    } catch (err) {
      alert(err.response?.data?.error || 'Cancellation failed');
    }
  };

  const totalSpent = bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + parseFloat(b.total_amount || 0), 0);
  const tabData = tab === 'all'
    ? bookings
    : tab === 'upcoming'
      ? bookings.filter((b) => new Date(b.travel_date) >= new Date() && b.status !== 'cancelled')
      : bookings.filter((b) => b.status === 'cancelled');

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1a3a6b)', borderRadius: 20, padding: '2rem', marginBottom: '2rem', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '0.2rem' }}>Welcome back</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>{user?.name}</h2>
            <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>{user?.email}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', textAlign: 'center' }}>
            {[[bookings.filter((b) => b.status !== 'cancelled').length, 'Total Trips'], [`Rs ${Math.round(totalSpent)}`, 'Total Spent'], ['4.9/5', 'Rating']].map(([v, l]) => (
              <div key={l}><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{v}</div><div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[['Search Buses', '/search'], ['My Tickets', '/tickets'], ['Contact', '/contact'], ['Home', '/']].map(([label, path]) => (
          <button key={label} className="card" style={{ border: 'none', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: 'white' }}
            onClick={() => navigate(path)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{label}</div>
          </button>
        ))}
      </div>

      <div className="tabs">
        {[['all', `All (${bookings.length})`], ['upcoming', 'Upcoming'], ['cancelled', `Cancelled (${bookings.filter((b) => b.status === 'cancelled').length})`]].map(([v, l]) => (
          <button key={v} className={`tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tabData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">Booking</div>
          <h3 style={{ marginBottom: '0.5rem' }}>{tab === 'all' ? 'No bookings yet' : tab === 'upcoming' ? 'No upcoming trips' : 'No cancelled bookings'}</h3>
          {tab === 'all' && <button className="btn btn-primary mt-2" onClick={() => navigate('/search')}>Book Your First Trip</button>}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Booking ID</th><th>Route</th><th>Date</th><th>Bus</th><th>Seats</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {tabData.map((b) => (
                <tr key={b.booking_id}>
                  <td style={{ fontWeight: 700 }}>#{b.booking_id}</td>
                  <td>{b.source} to {b.destination}</td>
                  <td>{b.travel_date ? new Date(b.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{b.bus_number}</td>
                  <td>{b.seats_booked}</td>
                  <td style={{ fontWeight: 700 }}>Rs {b.total_amount}</td>
                  <td><span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? 'badge-error' : 'badge-warning'}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'confirmed' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate('/tickets')}>Ticket</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b.booking_id)}>Cancel</button>
                      </div>
                    )}
                    {b.status === 'pending' && (
                      <button className="btn btn-sm btn-accent" onClick={() => navigate(`/payment?bookingId=${b.booking_id}`, { state: { booking: b, schedule: b } })}>
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
