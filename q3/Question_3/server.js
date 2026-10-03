const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simple in-memory session middleware (no Redis required)
app.use(
  session({
    secret: "express-login-session-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  })
);

// Demo user database in-memory with bcrypt hashed password
// Password for 'admin' is '123456'
const USERS = [
  {
    id: 1,
    username: "admin",
    passwordHash: bcrypt.hashSync("123456", 10),
    name: "Admin User",
    role: "Administrator",
  },
];

// Authentication Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/login?error=" + encodeURIComponent("Please login to access the dashboard"));
}

// Root route: Redirect to dashboard if logged in, otherwise to login
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.redirect("/login");
});

// Login Page Route
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Process Login Form Submission
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.redirect("/login?error=" + encodeURIComponent("Username and password are required"));
    }

    // Find user in demo database
    const user = USERS.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
      return res.redirect("/login?error=" + encodeURIComponent("Invalid username or password"));
    }

    // Compare submitted password with bcrypt hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.redirect("/login?error=" + encodeURIComponent("Invalid username or password"));
    }

    // Set user session
    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      loginTime: new Date().toLocaleTimeString(),
    };
    req.session.pageViews = 0;

    // Save session and redirect to dashboard
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Session error occurred");
      }
      res.redirect("/dashboard");
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal server error during login");
  }
});

// Protected Dashboard Page
app.get("/dashboard", isAuthenticated, (req, res) => {
  // Track visits in current session
  req.session.pageViews = (req.session.pageViews || 0) + 1;
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

// Protected API endpoint for current session data
app.get("/api/session-info", isAuthenticated, (req, res) => {
  res.json({
    user: req.session.user,
    sessionID: req.sessionID,
    pageViews: req.session.pageViews,
    cookie: req.session.cookie,
  });
});

// Logout Route
app.all("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Unable to logout");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login?message=" + encodeURIComponent("Logged out successfully"));
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Using simple Express session (MemoryStore - no Redis required)`);
});
