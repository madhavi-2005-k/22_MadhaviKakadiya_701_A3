const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const app = express();

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    store: new FileStore({
      path: "./sessions",
    }),
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  })
);

// Login page
app.get("/", (req, res) => {
  res.send(`
    <h1>Login Page</h1>

    <form method="POST" action="/login">
      <label>Username:</label>
      <input type="text" name="username" required>
      <br><br>

      <label>Password:</label>
      <input type="password" name="password" required>
      <br><br>

      <button type="submit">Login</button>
    </form>
  `);
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple username and password
  if (username === "admin" && password === "1234") {
    req.session.user = username;

    res.send(`
      <h2>Login Successful!</h2>
      <p>Welcome ${username}</p>

      <a href="/dashboard">Go to Dashboard</a>
      <br>
      <a href="/profile">Go to Profile</a>
      <br>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h2>Invalid username or password</h2>
      <a href="/">Try Again</a>
    `);
  }
});

// Middleware to protect routes
function checkLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.send(`
      <h2>Access Denied</h2>
      <p>Please login first.</p>
      <a href="/">Go to Login</a>
    `);
  }
}

// Protected Route 1
app.get("/dashboard", checkLogin, (req, res) => {
  res.send(`
    <h1>Dashboard</h1>
    <p>Hello ${req.session.user}!</p>
    <p>This is Protected Route 1.</p>

    <a href="/profile">Profile</a>
    <br>
    <a href="/logout">Logout</a>
  `);
});

// Protected Route 2
app.get("/profile", checkLogin, (req, res) => {
  res.send(`
    <h1>Profile</h1>
    <p>Username: ${req.session.user}</p>
    <p>This is Protected Route 2.</p>

    <a href="/dashboard">Dashboard</a>
    <br>
    <a href="/logout">Logout</a>
  `);
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error while logging out");
    }

    res.send(`
      <h2>You have been logged out.</h2>
      <a href="/">Login Again</a>
    `);
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
