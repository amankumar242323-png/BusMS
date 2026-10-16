import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAlerts, markAllRead } from '../services/api';

function HeaderLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: '#ff7a18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 800,
          lineHeight: 1,
          boxShadow: '0 8px 18px rgba(255,122,24,0.24)',
          flexShrink: 0,
        }}
      >
        Bus
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: -1 }}>
          Bus<span style={{ color: '#ff7a18' }}>MS</span>
        </span>
        <span style={{ fontSize: '0.45rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.15rem', textTransform: 'uppercase', marginTop: '0.1rem' }}>
          Management
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setShowAlerts(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      getAlerts()
        .then((r) => setAlerts(Array.isArray(r.data) ? r.data : []))
        .catch(() => setAlerts([]));
    } else {
      setAlerts([]);
    }
  }, [user, location.pathname]);

  const unread = Array.isArray(alerts) ? alerts.filter((a) => a.status === 'unread').length : 0;
  const handleLogout = () => {
    setMenuOpen(false);
    logoutUser();
    navigate('/');
  };

  const handleMarkAll = () => {
    markAllRead().then(() => setAlerts((prev) => (Array.isArray(prev) ? prev.map((a) => ({ ...a, status: 'read' })) : [])));
  };

  const navLinks = user?.role === 'admin'
    ? [['/', 'Home'], ['/admin', 'Dashboard'], ['/search', 'Search']]
    : user
      ? [['/', 'Home'], ['/search', 'Search'], ['/dashboard', 'Dashboard'], ['/tickets', 'My Tickets']]
      : [['/', 'Home'], ['/search', 'Search'], ['/about', 'About'], ['/contact', 'Contact']];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <nav className="navbar-container">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <HeaderLogo />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          {navLinks.map(([path, label]) => (
            <Link
              key={path}
              to={path}
              style={{
                color: location.pathname === path ? 'white' : 'rgba(255,255,255,0.7)',
                background: location.pathname === path ? 'rgba(255,255,255,0.12)' : 'none',
                padding: '0.5rem 0.875rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth / Action Area */}
        <div className="nav-auth-desktop">
          {user && (
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
                cursor: 'pointer',
                padding: '0.45rem 0.75rem',
                borderRadius: 8,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Notifications"
            >
              🔔
              {unread > 0 && (
                <span
                  style={{
                    background: '#f97316',
                    color: 'white',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
          )}

          {user ? (
            <>
              <div className="desktop-user-info" style={{ textAlign: 'right' }}>
                <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{user.role}</div>
              </div>
              <button className="btn btn-sm btn-ghost desktop-user-info" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="desktop-user-info" style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-sm btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="nav-hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Notifications Dropdown */}
          {showAlerts && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: 320,
                maxWidth: 'calc(100vw - 2rem)',
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                border: '1px solid #e2e8f0',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Notifications</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAll}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1a56db',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowAlerts(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {alerts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No notifications
                </div>
              ) : (
                alerts.slice(0, 6).map((a, idx) => (
                  <div
                    key={a.alert_id || a.id || idx}
                    style={{
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      gap: '0.75rem',
                      background: a.status === 'unread' ? 'rgba(26,86,219,0.03)' : 'white',
                    }}
                  >
                    {a.status === 'unread' && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a56db', marginTop: 6, flexShrink: 0 }}></div>
                    )}
                    <div>
                      <p style={{ fontSize: '0.82rem', color: '#0f172a', lineHeight: 1.5 }}>{a.message}</p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="nav-mobile-drawer">
          {navLinks.map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={location.pathname === path ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
          {user ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem' }}>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{user.email}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.5rem 0' }}>
              <Link to="/login" className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
