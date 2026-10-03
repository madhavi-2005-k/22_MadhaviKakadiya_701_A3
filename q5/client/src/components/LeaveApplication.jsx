import React, { useState, useEffect } from 'react';

export default function LeaveApplication({ token, onLogout }) {
  const [leaves, setLeaves] = useState([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/leaves', {
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
        throw new Error(data.message || 'Failed to fetch leaves');
      }

      setLeaves(data.leaves || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!date || !reason) {
      setError('Please provide both date and reason.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date, reason })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit leave application');
      }

      setMessage('Leave application submitted successfully (Grant: No)!');
      setDate('');
      setReason('');
      // Refresh list
      fetchLeaves();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleGrant = async (leaveId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${leaveId}/toggle-grant`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLeaves((prev) =>
          prev.map((item) => (item._id === leaveId ? data.leave : item))
        );
      }
    } catch (err) {
      console.error('Failed to toggle grant status', err);
    }
  };

  return (
    <div className="leave-container">
      <div className="leave-grid">
        {/* SECTION 1: ADD LEAVE FORM */}
        <div className="card">
          <div className="card-title">
            <span>➕ Apply for Leave</span>
          </div>

          {message && <div className="alert alert-success">✅ {message}</div>}
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleApplyLeave}>
            <div className="form-group">
              <label htmlFor="leaveDate">Leave Date</label>
              <input
                id="leaveDate"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="leaveReason">Reason for Leave</label>
              <textarea
                id="leaveReason"
                rows="4"
                className="form-textarea"
                placeholder="State the reason for leave (e.g., Medical emergency, Family function, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Default Grant Status</label>
              <div>
                <span className="badge badge-no">no (Pending Approval)</span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* SECTION 2: LIST LEAVES */}
        <div className="card">
          <div className="card-title">
            <span>📋 Leave Applications List</span>
            <button className="nav-btn" onClick={fetchLeaves} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading leave applications...</p>
          ) : leaves.length === 0 ? (
            <p style={{ color: '#64748b' }}>No leave applications submitted yet.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Leave Date</th>
                    <th>Reason</th>
                    <th>Grant (Yes/No)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>{index + 1}</td>
                      <td><strong>{item.date}</strong></td>
                      <td>{item.reason}</td>
                      <td>
                        <span className={`badge ${item.grant === 'yes' ? 'badge-yes' : 'badge-no'}`}>
                          {item.grant}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="toggle-btn"
                          title="Click to toggle grant status for demonstration"
                          onClick={() => handleToggleGrant(item._id)}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
