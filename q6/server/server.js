const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS so the React frontend can call this backend
app.use(cors());
app.use(express.json());

// Free External API URL (No API key needed)
const FREE_API_BASE_URL = 'https://open.er-api.com/v6/latest';

// Root route - information and health check
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    message: 'Q6 Practical: Free Currency Exchange API Proxy',
    endpoints: {
      convert: `http://localhost:${PORT}/api/convert?from=USD&to=INR&amount=100`,
      rates: `http://localhost:${PORT}/api/rates/USD`
    }
  });
});

// BACKEND API CALL: Fetch rates from external free API and calculate conversion
app.get('/api/convert', async (req, res) => {
  try {
    const from = (req.query.from || 'USD').toUpperCase();
    const to = (req.query.to || 'INR').toUpperCase();
    const amount = parseFloat(req.query.amount) || 1;

    // Call the external free API from the backend
    const apiResponse = await fetch(`${FREE_API_BASE_URL}/${from}`);
    if (!apiResponse.ok) {
      return res.status(502).json({ error: 'External Currency API request failed' });
    }

    const data = await apiResponse.json();
    const rate = data.rates && data.rates[to];

    if (!rate) {
      return res.status(400).json({ error: `Currency code "${to}" not found` });
    }

    const result = Number((amount * rate).toFixed(2));

    // Send back response with metadata indicating source is backend
    res.json({
      success: true,
      source: 'Backend (Node.js / Express Server)',
      from,
      to,
      amount,
      rate,
      result,
      lastUpdated: data.time_last_update_utc || new Date().toUTCString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// BACKEND API CALL: Get raw rates for any base currency
app.get('/api/rates/:base', async (req, res) => {
  try {
    const base = (req.params.base || 'USD').toUpperCase();
    const apiResponse = await fetch(`${FREE_API_BASE_URL}/${base}`);
    const data = await apiResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
