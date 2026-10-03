# Question 5: Employee Site with JWT, Express, Mongoose & React.js

This project implements an Employee Portal referencing **Question 4 (ERP System)** with JWT authentication, Profile viewing, and Leave Management.

---

## 🚀 Key Features

1. **JWT Authentication**:
   - Secure login using Employee ID (`empid`) / Email and Password (hashed with `bcryptjs`).
   - Generates a signed **JSON Web Token (JWT)** stored in the client `localStorage`.
   - Protected API routes verified via JWT authorization middleware (`Bearer <token>`).

2. **Home Page & Navigation**:
   - **Page 1: Display Employee Profile**:
     - Shows Employee ID, Name, Email, Department, Joining Date.
     - Displays detailed salary breakdown from Q4 (Basic Salary, HRA 20%, DA 10%, Deductions 5%, Net Salary).
   - **Page 2: Application for Leave**:
     - **Add Leave**: Form with `date`, `reason`, and default `grant: no`.
     - **List Leaves**: Table showing all submitted leave applications with their `grant` status (`yes`/`no`) and demonstration toggle button.
   - **Logout**: Clears the JWT token from storage and returns to login.

---

## 📁 Project Structure

```
q5/
├── server/
│   ├── models/
│   │   ├── Employee.js      # Uses Employee schema from Q4
│   │   └── Leave.js         # Leave schema (date, reason, grant yes/no)
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── .env                 # Environment config (PORT=5000, MONGO_URI, JWT_SECRET)
│   ├── seed.js              # Script to seed demo employee & sample leaves
│   ├── server.js            # Express server & API endpoints
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx   # Top header with Page1, Page2, and Logout
│   │   │   ├── Login.jsx    # JWT Login form with demo quick-fill
│   │   │   ├── Profile.jsx  # Page 1: Displays full employee profile
│   │   │   └── LeaveApplication.jsx # Page 2: Add & List leave applications
│   │   ├── App.jsx          # Root component managing JWT auth state
│   │   ├── index.css        # Clean responsive styles
│   │   └── main.jsx
│   └── package.json
├── package.json
└── README.md
```

---

## 🛠️ How to Run

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
# Default URI: mongodb://127.0.0.1:27017/erp_system
```

### 2. (Optional) Seed Test Data
Run the seed script inside `server` to guarantee test credentials:
```bash
cd server
node seed.js
```
> **Default Test Credentials:**
> - **Emp ID**: `EMP101`
> - **Password**: `password123`
> *(Any employee created in Q4 also works)*

### 3. Start the Backend Server
```bash
cd server
node server.js
```
The server will run at: `http://localhost:5000`

### 4. Start the React Frontend
In a separate terminal:
```bash
cd client
npm run dev
```
Open your browser at the URL shown (e.g. `http://localhost:5173`).

---

## 📡 API Endpoints

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates employee & returns JWT token |
| `GET` | `/api/employee/profile`| JWT Protected | Retrieves logged-in employee profile |
| `POST` | `/api/leaves` | JWT Protected | Submits new leave (`date`, `reason`, `grant: no`) |
| `GET` | `/api/leaves` | JWT Protected | Lists leaves for the logged-in employee |
| `PUT` | `/api/leaves/:id/toggle-grant` | JWT Protected | Toggles grant status (`yes`/`no`) |
