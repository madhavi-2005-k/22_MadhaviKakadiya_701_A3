const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Employee = require('./models/Employee');
const Leave = require('./models/Leave');
const verifyToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_system';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_employee_jwt_key_2026';

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(' Connected to MongoDB (erp_system)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ==========================================
// AUTHENTICATION ROUTES (JWT LOGIN)
// ==========================================

// Employee Login Route
app.post('/api/auth/login', async (req, res) => {
  const { empid, password } = req.body;

  if (!empid || !password) {
    return res.status(400).json({ success: false, message: 'Please enter Emp ID / Email and Password' });
  }

  try {
    // Search by empid or email (case-insensitive for email)
    const employee = await Employee.findOne({
      $or: [{ empid: empid.trim() }, { email: empid.trim().toLowerCase() }]
    });

    if (!employee) {
      return res.status(401).json({ success: false, message: 'Employee not found with provided ID or Email' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Generate JWT Token
    const payload = {
      id: employee._id,
      empid: employee.empid,
      name: employee.name,
      email: employee.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      employee: {
        id: employee._id,
        empid: employee.empid,
        name: employee.name,
        email: employee.email,
        department: employee.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ==========================================
// PAGE 1: EMPLOYEE PROFILE ROUTE
// ==========================================

// Get Current Logged-in Employee's Profile (Protected)
app.get('/api/employee/profile', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select('-password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }
    res.json({ success: true, employee });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// ==========================================
// PAGE 2: APPLICATION FOR LEAVE (Add, List)
// ==========================================

// Add New Leave Application (Protected)
app.post('/api/leaves', verifyToken, async (req, res) => {
  const { date, reason } = req.body;

  if (!date || !reason) {
    return res.status(400).json({ success: false, message: 'Date and Reason are required' });
  }

  try {
    const newLeave = new Leave({
      empid: req.user.empid,
      employeeName: req.user.name,
      date,
      reason,
      grant: 'no' // default as per specification
    });

    await newLeave.save();
    res.status(201).json({ success: true, message: 'Leave application submitted successfully', leave: newLeave });
  } catch (error) {
    console.error('Leave add error:', error);
    res.status(500).json({ success: false, message: 'Server error adding leave application' });
  }
});

// List All Leaves for Logged-in Employee (Protected)
app.get('/api/leaves', verifyToken, async (req, res) => {
  try {
    const leaves = await Leave.find({ empid: req.user.empid }).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (error) {
    console.error('Leave list error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leaves' });
  }
});

// Optional: Toggle Grant Status (useful for demo/testing yes/no grant)
app.put('/api/leaves/:id/toggle-grant', verifyToken, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave record not found' });
    }
    leave.grant = leave.grant === 'yes' ? 'no' : 'yes';
    await leave.save();
    res.json({ success: true, message: `Leave grant updated to ${leave.grant}`, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating leave' });
  }
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Q5 Backend Server running on http://localhost:${PORT}`);
});
