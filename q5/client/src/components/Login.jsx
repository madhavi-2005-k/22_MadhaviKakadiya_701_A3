import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [empid, setEmpid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!empid || !password) {
      setError('Please provide Emp ID and Password.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empid, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      // Store JWT token and user info
      localStorage.setItem('employeeToken', data.token);
      localStorage.setItem('employeeUser', JSON.stringify(data.employee));
      onLoginSuccess(data.token, data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>🔐 Employee Login</h2>
          <p>Sign in using your Employee ID and Password (JWT Protected)</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="empid">Employee ID or Email</label>
            <input
              id="empid"
              type="text"
              className="form-input"
              placeholder="e.g. EMP101 or email@domain.com"
              value={empid}
              onChange={(e) => setEmpid(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In with JWT'}
          </button>
        </form>
      </div>
    </div>
  );
}
