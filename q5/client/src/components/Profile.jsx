import React, { useState, useEffect } from 'react';

export default function Profile({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/employee/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        onLogout();
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch profile details.');
      }

      setProfile(data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card"><p>Loading employee profile data...</p></div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">❌ {error}</div>
        <button className="submit-btn" onClick={fetchProfile} style={{ maxWidth: '200px' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-container">
      {/* Basic Employee Details */}
      <div className="card">
        <div className="card-title">
          <span>👤 Employee Information</span>
          <span className="badge badge-yes">Active Status</span>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <div className="profile-label">Employee ID</div>
            <div className="profile-value">{profile.empid}</div>
          </div>

          <div className="profile-item">
            <div className="profile-label">Full Name</div>
            <div className="profile-value">{profile.name}</div>
          </div>

          <div className="profile-item">
            <div className="profile-label">Email Address</div>
            <div className="profile-value">{profile.email}</div>
          </div>

          <div className="profile-item">
            <div className="profile-label">Department</div>
            <div className="profile-value">{profile.department}</div>
          </div>

          <div className="profile-item">
            <div className="profile-label">Joining Date</div>
            <div className="profile-value">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Salary Details (From Q4 ERP Schema) */}
      <div className="card">
        <div className="card-title">
          <span>💰 Salary Structure & Breakdown</span>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <div className="profile-label">Basic Salary</div>
            <div className="profile-value">₹ {profile.basicSalary?.toLocaleString() || 0}</div>
          </div>

          <div className="profile-item">
            <div className="profile-label">HRA (20%)</div>
            <div className="profile-value">₹ {profile.hra?.toLocaleString() || 0}</div>
          </div>

          <div className="profile-item">
            <div className="profile-label">DA (10%)</div>
            <div className="profile-value">₹ {profile.da?.toLocaleString() || 0}</div>
          </div>

          <div className="profile-item">
            <div className="profile-label">Deductions (5%)</div>
            <div className="profile-value" style={{ color: '#dc2626' }}>
              - ₹ {profile.deductions?.toLocaleString() || 0}
            </div>
          </div>

          <div className="profile-item" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div className="profile-label" style={{ color: '#1d4ed8' }}>Net In-Hand Salary</div>
            <div className="profile-value highlight">
              ₹ {profile.netSalary?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
