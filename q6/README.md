# Question 6: Call Free API for Useful Utility from Frontend and Backend

This project demonstrates calling a **free, public API** for a useful utility (**Currency Converter / Exchange Rate Calculator**) from both:
1. **Frontend (Client-side)**: Direct browser `fetch()` call to the free API.
2. **Backend (Server-side)**: Node.js / Express server calling the free API and providing a proxy endpoint (`/api/convert`).

---

## 🌐 Free API Used
- **API**: [Open Exchange Rate API](https://open.er-api.com/v6/latest/)
- **Features**: Completely **free**, **no API key** required, no rate-limiting issues, live conversion rates for 160+ currencies.
- **Utility**: Convert monetary amounts between world currencies (USD, INR, EUR, GBP, JPY, CAD, AUD, etc.).

---

## 📁 Project Structure

```
q6/
├── server/
│   ├── package.json         # Express & CORS dependencies
│   └── server.js            # Node.js backend calling the free API
├── client/
│   ├── src/
│   │   ├── App.jsx          # React component with Frontend & Backend call options
│   │   ├── App.css          # Simple CSS styling (no icons)
│   │   └── main.jsx         # React DOM root entry
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # React & Vite dependencies
├── package.json             # Root scripts ("server", "client")
└── README.md
```

---

## 🚀 How to Run the Project

### 1. Start the Backend Server (Port 5001)
From the `q6` directory:
```bash
npm run server
```
*Server starts at `http://localhost:5001`.*

### 2. Start the Frontend Client (Port 5173)
In a second terminal window, run:
```bash
npm run client
```
*Open `http://localhost:5173` in your browser.*

---

## 💡 How the API Calls Work

### 1. Frontend API Call (Browser `fetch`)
In [`client/src/App.jsx`](file:///d:/sem7/mern/assi3-mern-practical/q6/client/src/App.jsx):
- React directly calls:
  ```javascript
  const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
  const data = await res.json();
  const rate = data.rates[to];
  const converted = (amount * rate).toFixed(2);
  ```
- **Advantages**: Quick, works client-side without any backend server.

### 2. Backend API Call (Node.js / Express)
In [`server/server.js`](file:///d:/sem7/mern/assi3-mern-practical/q6/server/server.js):
- Express route `GET /api/convert?from=USD&to=INR&amount=100`:
  ```javascript
  app.get('/api/convert', async (req, res) => {
    const { from, to, amount } = req.query;
    const apiResponse = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await apiResponse.json();
    const rate = data.rates[to];
    const result = Number((amount * rate).toFixed(2));

    res.json({
      success: true,
      source: 'Backend (Node.js / Express Server)',
      from,
      to,
      amount,
      rate,
      result
    });
  });
  ```
- React client calls:
  ```javascript
  const res = await fetch(`http://localhost:5001/api/convert?from=${from}&to=${to}&amount=${amount}`);
  const data = await res.json();
  ```
- **Advantages**: Hides external endpoints, allows server-side caching, rate limiting, and business validation.

---

## 🧪 Sample Test Cases

| Amount | From | To | Result | Note |
|---|---|---|---|---|
| `100` | `USD` | `INR` | `~ 8,350 INR` | Works via both Frontend & Backend |
| `1` | `EUR` | `USD` | `~ 1.08 USD` | Real-time exchange rate calculation |
| `500` | `GBP` | `INR` | `~ 54,000 INR` | Clean result with last updated timestamp |
