import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Profile from './components/Profile';
import LeaveApplication from './components/LeaveApplication';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('employeeToken') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('employeeUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activePage, setActivePage] = useState('profile'); // 'profile' or 'leave'

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setActivePage('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeUser');
    setToken('');
    setUser(null);
  };

  // If not authenticated, render Login Page
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // If authenticated, render Home Layout with Navigation
  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activePage === 'profile' && (
          <Profile token={token} onLogout={handleLogout} />
        )}

        {activePage === 'leave' && (
          <LeaveApplication token={token} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}
