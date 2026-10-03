import React, { useState } from 'react';

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'AED', 'SGD', 'CNY'];

export default function App() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [sourceMode, setSourceMode] = useState('frontend'); // 'frontend' or 'backend'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Call Free API directly from FRONTEND (Browser)
  const fetchFromFrontend = async () => {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    if (!res.ok) {
      throw new Error('Failed to fetch from free API in frontend');
    }
    const data = await res.json();
    const rate = data.rates[to];

    if (!rate) {
      throw new Error(`Rate for currency ${to} not found`);
    }

    return {
      source: 'Frontend (Direct Browser Call)',
      from,
      to,
      amount: Number(amount),
      rate: rate,
      result: Number((Number(amount) * rate).toFixed(2)),
      lastUpdated: data.time_last_update_utc || new Date().toUTCString()
    };
  };

  // 2. Call Free API via BACKEND (Node.js / Express Server)
  const fetchFromBackend = async () => {
    const url = `http://localhost:5001/api/convert?from=${from}&to=${to}&amount=${amount}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Backend call failed. Is "npm run server" running on port 5001?');
    }
    const data = await res.json();
    return {
      source: 'Backend (Node.js Express Server)',
      from: data.from,
      to: data.to,
      amount: data.amount,
      rate: data.rate,
      result: data.result,
      lastUpdated: data.lastUpdated
    };
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!amount || Number(amount) <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      if (sourceMode === 'frontend') {
        const data = await fetchFromFrontend();
        setResult(data);
      } else {
        const data = await fetchFromBackend();
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h2>Currency Converter Utility</h2>
        <p className="subtitle">Practical 6: Call Free API from Frontend & Backend</p>
      </header>

      {/* Main Conversion Form */}
      <form onSubmit={handleConvert} className="card form-card">
        {/* Source Selector: Frontend vs Backend */}
        <div className="form-group">
          <label className="label">Choose API Call Method:</label>
          <div className="radio-options">
            <label className="radio-item">
              <input
                type="radio"
                name="sourceMode"
                value="frontend"
                checked={sourceMode === 'frontend'}
                onChange={() => setSourceMode('frontend')}
              />
              Frontend Call (Browser fetch)
            </label>

            <label className="radio-item">
              <input
                type="radio"
                name="sourceMode"
                value="backend"
                checked={sourceMode === 'backend'}
                onChange={() => setSourceMode('backend')}
              />
              Backend Call (Express Server on port 5001)
            </label>
          </div>
        </div>

        {/* Inputs row */}
        <div className="input-grid">
          <div className="form-group">
            <label className="label">Amount:</label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">From Currency:</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="form-control"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">To Currency:</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="form-control"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Converting...' : 'Convert Currency'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="card error-box">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Conversion Result Display */}
      {result && (
        <div className="card result-card">
          <div className="source-tag">Source: {result.source}</div>
          <div className="result-value">
            {result.amount} {result.from} = {result.result} {result.to}
          </div>
          <p className="rate-text">
            Current Rate: 1 {result.from} = {result.rate} {result.to}
          </p>
          <div className="meta-text">Last Updated: {result.lastUpdated}</div>
        </div>
      )}

      {/* Practical Explanation Box */}
      {/* <div className="card info-card">
        <h3>How It Works:</h3>
        <p>
          <strong>1. Frontend API Call:</strong> Client makes a direct <code>fetch()</code> request to <code>https://open.er-api.com/v6/latest/{from}</code> and computes the conversion in the browser.
        </p>
        <p>
          <strong>2. Backend API Call:</strong> Client requests <code>http://localhost:5001/api/convert</code>. The Express server calls the external API, processes the rates, and returns the converted amount.
        </p>
      </div> */}
    </div>
  );
}
