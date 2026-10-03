import React from 'react';

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-wrapper">
        <div className="nav-brand">
          <span>🏢</span>
          <span>Employee Portal</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            👤 Page 1: Profile
          </button>

          <button
            className={`nav-btn ${activePage === 'leave' ? 'active' : ''}`}
            onClick={() => setActivePage('leave')}
          >
            📝 Page 2: Leave Application
          </button>

          <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>|</span>

          {user && (
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
              {user.name} ({user.empid})
            </span>
          )}

          <button className="logout-btn" onClick={onLogout} title="Sign Out">
            Logout ⏻
          </button>
        </nav>
      </div>
    </header>
  );
}
