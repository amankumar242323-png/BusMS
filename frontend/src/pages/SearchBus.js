import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRoutes, searchSchedules } from '../services/api';
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

  useEffect(() => {
    if (urlParams.get('source') || urlParams.get('destination')) handleSearch();
  }, []);

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

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (src) params.source = src;
      if (dst) params.destination = dst;
      if (date) params.travel_date = date;
      const res = await searchSchedules(params);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? results : results.filter((r) => r.bus_type.toLowerCase().includes(filter));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Search Buses</h1>
        <p className="page-sub">Find the best buses for your journey</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
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
            <input className="form-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {searched && !loading && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[['all', 'All Buses'], ['ac sleeper', 'AC Sleeper'], ['ac seater', 'AC Seater'], ['non-ac', 'Non-AC'], ['luxury', 'Luxury']].map(([v, l]) => (
            <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : searched ? (
        filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">Bus</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No buses found</h3>
            <p>Try changing your search criteria or travel date</p>
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
