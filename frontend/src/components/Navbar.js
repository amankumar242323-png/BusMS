import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAlerts, markAllRead } from '../services/api';

function HeaderLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: '#ff7a18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 800,
          lineHeight: 1,
          boxShadow: '0 10px 22px rgba(255,122,24,0.24)',
          flexShrink: 0,
        }}
      >
        Bus
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white', letterSpacing: -1.2 }}>
          Bus<span style={{ color: '#ff7a18' }}>MS</span>
        </span>
        <span style={{ fontSize: '0.48rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.24rem', textTransform: 'uppercase', marginTop: '0.16rem' }}>
          Bus Management System
        </span>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    if (user) {
      getAlerts().then((r) => setAlerts(r.data)).catch(() => {});
    }
  }, [user, location.pathname]);

  const unread = alerts.filter((a) => a.status === 'unread').length;
  const handleLogout = () => { logoutUser(); navigate('/'); };
  const handleMarkAll = () => {
    markAllRead().then(() => setAlerts((prev) => prev.map((a) => ({ ...a, status: 'read' }))));
  };

  const navLinks = user?.role === 'admin'
    ? [['/', 'Home'], ['/admin', 'Dashboard'], ['/search', 'Search']]
    : user
      ? [['/', 'Home'], ['/search', 'Search'], ['/dashboard', 'Dashboard'], ['/tickets', 'My Tickets']]
      : [['/', 'Home'], ['/search', 'Search'], ['/about', 'About'], ['/contact', 'Contact']];

  return (
    <nav style={{ background: '#0f172a', color: 'white', padding: '0 1.5rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <HeaderLogo />
      </Link>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {navLinks.map(([path, label]) => (
          <Link key={path} to={path} style={{ color: location.pathname === path ? 'white' : 'rgba(255,255,255,0.7)', background: location.pathname === path ? 'rgba(255,255,255,0.12)' : 'none', padding: '0.5rem 0.875rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
        {user && (
          <button onClick={() => setShowAlerts(!showAlerts)} style={{ position: 'relative', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.5rem', borderRadius: 8, fontSize: '0.9rem' }}>
            Alerts
            {unread > 0 && <span style={{ position: 'absolute', top: 4, right: 4, background: '#f97316', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread}</span>}
          </button>
        )}

        {user ? (
          <>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{user.role}</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
          </>
        )}

        {showAlerts && (
          <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 340, background: 'white', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 200, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Notifications</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {unread > 0 && <button onClick={handleMarkAll} style={{ background: 'none', border: 'none', color: '#1a56db', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Mark all read</button>}
                <button onClick={() => setShowAlerts(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>x</button>
              </div>
            </div>
            {alerts.length === 0
              ? <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No notifications</div>
              : alerts.slice(0, 6).map((a) => (
                  <div key={a.alert_id} style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', background: a.status === 'unread' ? 'rgba(26,86,219,0.02)' : 'white' }}>
                    {a.status === 'unread' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a56db', marginTop: 6, flexShrink: 0 }}></div>}
                    <div>
                      <p style={{ fontSize: '0.82rem', color: '#0f172a', lineHeight: 1.5 }}>{a.message}</p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </nav>
  );
}
