import { useNavigate } from 'react-router-dom';

export default function BusCard({ schedule }) {
  const navigate = useNavigate();

  const getDuration = () => {
    const [dh, dm] = schedule.departure_time.split(':').map(Number);
    const [ah, am] = schedule.arrival_time.split(':').map(Number);
    let mins = (ah * 60 + am) - (dh * 60 + dm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  const price = Math.round(schedule.base_price);
  const seatsLeft = schedule.available_seats;

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '2px solid #e2e8f0', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start', transition: 'all 0.25s', cursor: 'pointer' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,86,219,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: 'linear-gradient(135deg,#1a56db,#3b82f6)', color: 'white', borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}>{schedule.bus_type}</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{schedule.bus_number}</span>
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {schedule.source} <span style={{ color: '#1a56db', fontWeight: 400 }}>to</span> {schedule.destination}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.75rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{schedule.departure_time}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Departure</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#e2e8f0', transform: 'translateY(-50%)' }}></div>
            <span style={{ position: 'relative', background: 'white', padding: '0 0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{getDuration()}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{schedule.arrival_time}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Arrival</div>
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
          Driver: {schedule.driver_name} | Date: {new Date(schedule.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {(schedule.amenities || []).map((a) => <span key={a} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, color: '#334155' }}>{a}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a56db', letterSpacing: -1 }}>Rs {price}<span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/seat</span></div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: seatsLeft > 10 ? '#10b981' : seatsLeft > 0 ? '#f59e0b' : '#ef4444' }}>
          {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Sold Out'}
        </div>
        <button className="btn btn-primary" disabled={seatsLeft === 0} onClick={() => navigate('/booking', { state: { schedule } })}>
          {seatsLeft > 0 ? 'Book Now ->' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
}
