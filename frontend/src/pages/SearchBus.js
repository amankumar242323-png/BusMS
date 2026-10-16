import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRoutes, searchSchedules, BASE_URL } from '../services/api';
import BusCard from '../components/BusCard';

export default function SearchBus() {
  const [urlParams] = useSearchParams();
  const [src, setSrc] = useState(urlParams.get('source') || '');
  const [dst, setDst] = useState(urlParams.get('destination') || '');
  const [date, setDate] = useState(urlParams.get('travel_date') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('all');
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleSearch({
      source: urlParams.get('source') || '',
      destination: urlParams.get('destination') || '',
      travel_date: urlParams.get('travel_date') || '',
    });
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await getRoutes();
        const routeData = Array.isArray(res.data) ? res.data : [];
        const nextCities = [...new Set(
          routeData.flatMap((route) => [route.source, route.destination]).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
        setCities(nextCities);
      } catch (err) {
        setCities([]);
        if (!error) {
          setError(err.response?.data?.error || err.message || 'Cannot connect to backend server');
        }
      }
    };

    loadCities();
  }, []);

  const handleSearch = async (overrideParams) => {
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const activeSrc = overrideParams?.source !== undefined ? overrideParams.source : src;
      const activeDst = overrideParams?.destination !== undefined ? overrideParams.destination : dst;
      const activeDate = overrideParams?.travel_date !== undefined ? overrideParams.travel_date : date;

      const params = {};
      if (activeSrc) params.source = activeSrc;
      if (activeDst) params.destination = activeDst;
      if (activeDate) params.travel_date = activeDate;

      const res = await searchSchedules(params);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setResults([]);
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Unable to connect to backend';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSrc('');
    setDst('');
    setDate('');
    setFilter('all');
    handleSearch({ source: '', destination: '', travel_date: '' });
  };

  const filtered = filter === 'all' ? results : results.filter((r) => r.bus_type.toLowerCase().includes(filter));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Search Buses</h1>
        <p className="page-sub">Find the best buses for your journey</p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          border: '1px solid #f87171',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>⚠️ Server Communication Notice</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{error}</div>
            <div style={{ fontSize: '0.8rem', color: '#7f1d1d', marginTop: '0.35rem' }}>
              Target API: <code>{BASE_URL}</code>
              {BASE_URL.includes('onrender.com') && (
                <span> • <em>Note: Free-tier Render instances sleep when inactive and may take 30–60 seconds to boot up.</em></span>
              )}
            </div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => handleSearch()}>
            Retry Connection
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="hero-search-bar">
          <div className="form-group">
            <label>From</label>
            <select className="form-control" value={src} onChange={(e) => setSrc(e.target.value)}>
              <option value="">Any City</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>To</label>
            <select className="form-control" value={dst} onChange={(e) => setDst(e.target.value)}>
              <option value="">Any City</option>
              {cities.filter((c) => c !== src).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              className="form-control"
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => handleSearch()}>Search</button>
            {(src || dst || date) && (
              <button className="btn btn-outline btn-lg" onClick={handleReset} title="Clear Filters">Clear</button>
            )}
          </div>
        </div>
      </div>

      {searched && !loading && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {[['all', 'All Buses'], ['ac sleeper', 'AC Sleeper'], ['ac seater', 'AC Seater'], ['non-ac', 'Non-AC'], ['luxury', 'Luxury']].map(([v, l]) => (
            <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
          {(src || dst || date || filter !== 'all') && (
            <button className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }} onClick={handleReset}>Reset All Filters</button>
          )}
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : searched ? (
        filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">Bus</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No buses match your criteria</h3>
            <p style={{ marginBottom: '1rem' }}>Try clearing filters or checking other dates or routes.</p>
            <button className="btn btn-primary" onClick={handleReset}>Show All Available Buses</button>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{filtered.length} bus{filtered.length > 1 ? 'es' : ''} found</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((s) => <BusCard key={s.schedule_id} schedule={s} />)}
            </div>
          </div>
        )
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">Search</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Search for buses</h3>
          <p>Enter source, destination and date to find available buses</p>
        </div>
      )}
    </div>
  );
}
