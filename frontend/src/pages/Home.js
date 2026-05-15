import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes } from '../services/api';
const fmt = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const navigate = useNavigate();
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [date, setDate] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await getRoutes();
        const nextCities = [...new Set(
          res.data.flatMap((route) => [route.source, route.destination]).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
        setCities(nextCities);
      } catch {
        setCities([]);
      }
    };

    loadCities();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (src) params.set('source', src);
    if (dst) params.set('destination', dst);
    if (date) params.set('travel_date', date);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1a2e4a 40%,#1a3a6b 100%)', color: 'white', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
            Smart bus booking across India
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: -1 }}>
            Travel <span style={{ color: '#f97316' }}>Smarter</span>,<br />Book <span style={{ color: '#f97316' }}>Faster</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            Search hundreds of bus routes, compare prices, pick your seats, and travel comfortably across India.
          </p>

          <div style={{ background: 'white', borderRadius: 24, padding: '1.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', maxWidth: 860, margin: '0 auto' }}>
            {[['From', src, setSrc, cities], ['To', dst, setDst, cities.filter((c) => c !== src)]].map(([label, val, setter, opts]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                <select value={val} onChange={(e) => setter(e.target.value)} className="form-control">
                  <option value="">Select City</option>
                  {opts.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</label>
              <input type="date" className="form-control" value={date} min={fmt(new Date())} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button className="btn btn-accent btn-lg" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </section>

      <div style={{ background: '#1a56db', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {[['500+', 'Routes'], ['10K+', 'Daily Bookings'], ['50+', 'Operators'], ['4.8/5', 'Rating']].map(([v, l]) => (
            <div key={l}><div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: -1 }}>{v}</div><div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={{ padding: '4rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Why Choose <span style={{ color: '#1a56db' }}>BusMS?</span></h2>
          <p style={{ color: '#64748b' }}>Everything you need for a comfortable journey</p>
        </div>
        <div className="grid-3">
          {[
            ['Seat Selection', 'Visual seat map so you can see which seats are available.'],
            ['Secure Payments', 'Card, UPI, or Net Banking with secure checkout.'],
            ['Instant Tickets', 'Digital ticket ready immediately after payment.'],
            ['Live Alerts', 'Booking confirmation, delays, and payment receipts in real time.'],
            ['Travel History', 'All your journeys, bookings and payments in one dashboard.'],
            ['Night Buses', 'Overnight sleeper buses for long-distance travel.'],
          ].map(([title, desc]) => (
            <div key={title} className="card" style={{ transition: 'all 0.2s', cursor: 'default' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#f1f5f9', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>Popular Routes</h2>
          <div className="grid-3">
            {[{ src: 'Mumbai', dst: 'Pune', price: 300, time: '3.5h', buses: 12 }, { src: 'Mumbai', dst: 'Goa', price: 1121, time: '12h', buses: 8 }, { src: 'Delhi', dst: 'Agra', price: 350, time: '4h', buses: 15 }, { src: 'Pune', dst: 'Bangalore', price: 1257, time: '12h', buses: 10 }, { src: 'Chennai', dst: 'Bangalore', price: 606, time: '6h', buses: 18 }, { src: 'Delhi', dst: 'Jaipur', price: 449, time: '5.5h', buses: 20 }].map((r) => (
              <div key={r.src + r.dst} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => { const p = new URLSearchParams({ source: r.src, destination: r.dst }); navigate(`/search?${p}`); }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700 }}>{r.src} to {r.dst}</div>
                  <div style={{ color: '#1a56db', fontWeight: 800, fontSize: '1.1rem' }}>Rs {r.price}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>{r.time}</span><span>{r.buses} buses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
