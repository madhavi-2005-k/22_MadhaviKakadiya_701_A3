# Question 3: Express Login Application with Session Store

An Express authentication application using standard in-memory session management (`express-session`) and `bcrypt` for secure password hashing.

## Features
- **Session Management**: Built using `express-session` (in-memory store, zero external Redis dependencies required).
- **Password Security**: Passwords verified via `bcrypt.compare`.
- **Protected Routes**: `/dashboard` and `/api/session-info` protected by authentication middleware.
- **Session Tracking**: Tracks user details, session ID, login time, and page view count across requests.
- **Logout & Cleanup**: Destroys session on logout and clears session cookie.

## Demo Credentials
- **Username**: `admin`
- **Password**: `123456`

## How to Run

1. Open a terminal in the `Question_3` directory:
   ```bash
   cd Question_3
   ```

2. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```

3. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Application Routes
- `GET /`: Redirects to `/dashboard` if logged in, otherwise redirects to `/login`.
- `GET /login`: Displays the login form.
- `POST /login`: Authenticates username & password and establishes session.
- `GET /dashboard`: Protected dashboard page displaying active session statistics.
- `GET /api/session-info`: JSON endpoint returning current session data.
- `GET /logout`: Destroys the session, clears cookie, and redirects to login.
